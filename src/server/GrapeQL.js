"use strict";

const _ = require("lodash");
const pg = require("pg");
const fs = require("fs");
const Node = require("./Node");

const DbScheme = require("./DbObject/DbScheme");
const DbTable = require("./DbObject/DbTable");
const DbColumn = require("./DbObject/DbColumn");
const DbFunction = require("./DbObject/DbFunction");
const DbConstraint = require("./DbObject/DbConstraint");

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
        let res;
        
        res = await this.db.query(`
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
                pg_columns.table_schema != 'information_schema'
        `);
        
        this.schemes = {};
        _.each(res.rows, row => {
            let schemeName = row.table_schema,
                scheme = this.schemes[ schemeName ];
            
            if ( !scheme ) {
                scheme = new DbScheme({ name: schemeName });
                this.schemes[ schemeName ] = scheme;
            }
            
            let tableName = row.table_name,
                table = scheme.getTable( tableName );
            
            if ( !table ) {
                table = new DbTable({
                    name: tableName,
                    scheme: schemeName
                });
                scheme.addTable( table );
            }
            
            let column = new DbColumn({
                name: row.column_name,
                default: row.column_default,
                type: row.data_type,
                nulls: row.is_nullable == "YES",
                // for tests
                table: tableName,
                scheme: schemeName
            });
            
            table.addColumn( column );
        });
        
        res = await this.db.query(`
            select
                routines.routine_name,
                routines.routine_schema,
                routines.data_type
            from information_schema.routines
        `);
        _.each(res.rows, row => {
            let schemeName = row.routine_schema,
                scheme = this.schemes[ schemeName ];
            
            if ( !scheme ) {
                scheme = new DbScheme({ name: schemeName });
                this.schemes[ schemeName ] = scheme;
            }
            
            let dbFunction = new DbFunction({
                scheme: schemeName,
                name: row.routine_name,
                returnType: row.data_type
            });
            
            scheme.addFunction(dbFunction);
        });
        
        res = await this.db.query(`
            select 
            	tc.constraint_type,
            	tc.constraint_name,
            	tc.table_schema, 
            	tc.table_name,
            	array_agg(kc.column_name::text) as columns

            from information_schema.table_constraints tc

            join information_schema.key_column_usage kc on 
              kc.table_name = tc.table_name and 
              kc.table_schema = tc.table_schema and 
              kc.constraint_name = tc.constraint_name

            group by tc.constraint_type,
            	tc.constraint_name,
            	tc.table_schema, 
            	tc.table_name
        `);
        _.each(res.rows, row => {
            let schemeName = row.table_schema,
                scheme = this.schemes[ schemeName ];
            
            if ( !scheme ) {
                scheme = new DbScheme({ name: schemeName });
                this.schemes[ schemeName ] = scheme;
            }
            
            let tableName = row.table_name,
                table = scheme.getTable( tableName );
            
            if ( !table ) {
                table = new DbTable({
                    name: tableName,
                    scheme: schemeName
                });
                scheme.addTable( table );
            }
            
            let constraint = new DbConstraint({
                name: row.constraint_name,
                type: row.constraint_type.toLowerCase(),
                columns: row.columns
            });
            table.addConstraint( constraint );
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
