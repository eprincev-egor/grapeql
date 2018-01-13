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
        
        this.tables = {};
        _.each(res.rows, (row) => {
            let tableName = row.table_name,
                table = this.tables[ tableName ];
            
            if ( !table ) {
                table = this.tables[ tableName ] = {};
                table.name = tableName;
                table.schema = row.schme_name;
                table.columns = {};
            }
            
            let column = {
                name: row.column_name,
                default: row.column_default,
                type: row.data_type,
                nulls: row.is_nullable == "YES"
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
