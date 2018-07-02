"use strict";

const _ = require("lodash");

const DbSchema = require("./DbSchema");
const DbTable = require("./DbTable");
const DbColumn = require("./DbColumn");
const DbFunction = require("./DbFunction");
const DbConstraint = require("./DbConstraint");

class DbDatabase {
    constructor() {
        this.schemas = {};
    }
    
    async load(db) {
        let res;

        res = await db.query(`
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

        res = await db.query(`
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

        res = await db.query(`
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

    findTable(name) {
        let schema = "public";
        let table;

        if ( /\./.test(name) ) {
            name = name.split(".");
            schema = name[0];
            table = name[1];
        } else {
            table = name;
        }

        let dbSchema = this.getSchema(schema);
        
        if ( !dbSchema ) {
            return;
        }

        return dbSchema.getTable(table);
    }
}

module.exports = DbDatabase;
