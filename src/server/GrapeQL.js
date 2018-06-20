"use strict";

const _ = require("lodash");
const pg = require("pg");
const fs = require("fs");
const Node = require("./Node");
const Transaction = require("./Transaction");

const DbSchema = require("./DbObject/DbSchema");
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
        await this.initSystemFunctions();
    }
    
    async initSystemFunctions() {
        await this.db.query(`
        create or replace function raise_exception(text)
        returns void as $$
        begin
          raise exception '%', $1;
        end;
        $$ language plpgsql;
        `);
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

        this.schemas = {};
        _.each(res.rows, row => {
            let schemaName = row.table_schema,
                schema = this.schemas[ schemaName ];

            if ( !schema ) {
                schema = new DbSchema({ name: schemaName });
                this.schemas[ schemaName ] = schema;
            }

            let tableName = row.table_name,
                table = schema.getTable( tableName );

            if ( !table ) {
                table = new DbTable({
                    name: tableName,
                    schema: schemaName
                });
                schema.addTable( table );
            }

            let column = new DbColumn({
                name: row.column_name,
                default: row.column_default,
                type: row.data_type,
                nulls: row.is_nullable == "YES",
                // for tests
                table: tableName,
                schema: schemaName
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
            let schemaName = row.routine_schema,
                schema = this.schemas[ schemaName ];

            if ( !schema ) {
                schema = new DbSchema({ name: schemaName });
                this.schemas[ schemaName ] = schema;
            }

            let dbFunction = new DbFunction({
                schema: schemaName,
                name: row.routine_name,
                returnType: row.data_type
            });

            schema.addFunction(dbFunction);
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
            let schemaName = row.table_schema,
                schema = this.schemas[ schemaName ];

            if ( !schema ) {
                schema = new DbSchema({ name: schemaName });
                this.schemas[ schemaName ] = schema;
            }

            let tableName = row.table_name,
                table = schema.getTable( tableName );

            if ( !table ) {
                table = new DbTable({
                    name: tableName,
                    schema: schemaName
                });
                schema.addTable( table );
            }

            let constraint = new DbConstraint({
                name: row.constraint_name,
                type: row.constraint_type.toLowerCase(),
                columns: row.columns
            });
            table.addConstraint( constraint );
        });
    }

    getSchema(name) {
        if ( name in this.schemas ) {
            return this.schemas[ name ];
        }
        for (let key in this.schemas) {
            if ( key.toLowerCase() == name.toLowerCase() ) {
                return this.schemas[ key ];
            }
        }
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

    addNode(name, node) {
        if ( _.isString(node) ) {
            if ( fs.existsSync(node) ) {
                node = fs.readFileSync( node );
            }
            node = new Node({sql: node}, this);
            this.nodes[ name ] = node;
        }
        else if ( node instanceof Node ) {
            this.nodes[ name ] = node;
        }

        return node;
    }

    async stop() {
        await this.db.end();
    }
    
    transaction() {
        return new Transaction({
            server: this
        });
    }
}

GrapeQL.start = async function(config) {
    let server = new GrapeQL(config);
    await server.start();
    return server;
};

module.exports = GrapeQL;
