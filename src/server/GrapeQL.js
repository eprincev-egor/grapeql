"use strict";

const _ = require("lodash");
const pg = require("pg");
const fs = require("fs");
const Node = require("./Node");

class GrapeQL {
    constructor(config) {
        this.config = config;
    }
    
    async start() {
        const db = new pg.Client( this.config.db );
        await db.connect();
        this.db = db;
        
        await this.loadTables();
        await this.loadNodes();
    }
    
    async loadTables() {
        let res = await this.db.query(`
            select
                pg_columns.table_schema,
                pg_columns.table_name,
                pg_columns.column_name,
                pg_columns.column_default,
                pg_columns.data_type,
                pg_columns.is_nullable
            from information_schema.columns as pg_columns 
            
            where
                pg_columns.table_schema != 'pg_catalog' and 
                pg_columns.table_name != 'information_schema'
        `);
        
        this.schemes = {};
        _.each(res.rows, (row) => {
            let schemeName = row.schme_name,
                scheme = this.schemes[ schemeName ];
            
            if ( !scheme ) {
                scheme = {
                    name: schemeName,
                    tables: {}
                };
                this.schemes[ schemeName ] = scheme;
            }
            
            let tableName = row.table_name,
                table = scheme.tables[ tableName ];
            
            if ( !table ) {
                table = {
                    name: tableName,
                    scheme: schemeName,
                    columns: {}
                };
                scheme.tables[ tableName ] = table;
            }
            
            let column = {
                name: row.column_name,
                default: row.column_default,
                type: row.data_type,
                nulls: row.is_nullable == "YES",
                // for tests
                table: tableName,
                scheme: schemeName
            };
            
            table.columns[ column.name ] = column;
        });
    }
    
    async loadNodes() {
        if ( !this.config.nodes ) {
            this.nodes = {};
            return;
        }
        
        let nodes = {};
        if ( _.isString(this.config.nodes) ) {
            let files = fs.readdirSync(this.config.nodes);

            files.forEach(fileName => {
                let nodeName = fileName.replace(/\.sql$/i, "");
                nodes[ nodeName ] = this.config.nodes + "/" + fileName;
            });
        }
        
        for (let nodeName in nodes) {
            let fileName = nodes[ nodeName ];
            
            if ( fileName instanceof Node ) {
                nodes[ nodeName ] = fileName;
                continue;
            }
            
            let node = new Node(fileName, this);
            nodes[ nodeName ] = node;
        }

        this.nodes = nodes;
    }
}

GrapeQL.start = async function(config) {
    let server = new GrapeQL(config);
    await server.start();
    return server;
};

module.exports = GrapeQL;
