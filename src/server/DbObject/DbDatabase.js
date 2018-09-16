"use strict";

const _ = require("lodash");
const fs = require("fs");
const gql_system = fs.readFileSync(__dirname + "/gql_system.sql").toString();

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
        this.db = db;

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
            
            order by pg_columns.ordinal_position
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
            rc.update_rule,
            rc.delete_rule,
            (
                select
                    array_agg(kc.column_name::text)
                from information_schema.key_column_usage as kc
                where
                    kc.table_name = tc.table_name and
                    kc.table_schema = tc.table_schema and
                    kc.constraint_name = tc.constraint_name
            ) as columns,
            fk_info.columns as reference_columns,
            fk_info.table_name as reference_table
        from information_schema.table_constraints as tc

        left join information_schema.referential_constraints as rc on
            rc.constraint_schema = tc.constraint_schema and
            rc.constraint_name = tc.constraint_name
        
        left join lateral (
            select
                ( array_agg( distinct ccu.table_name::text ) )[1] as table_name,
                array_agg( ccu.column_name::text ) as columns
            from information_schema.constraint_column_usage as ccu
            where
                ccu.constraint_name = rc.constraint_name and
                ccu.constraint_schema = rc.constraint_schema
        ) as fk_info on true

        where
            tc.constraint_type in ('FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY')
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
                columns: row.columns,
                
                // fk info
                onUpdate: row.update_rule ? 
                    row.update_rule.toLowerCase() : 
                    null,
                onDelete: row.delete_rule ? 
                    row.delete_rule.toLowerCase() : 
                    null,
                referenceTable: row.reference_table,
                referenceColumns: row.reference_columns
            });
            table.addConstraint( constraint );
        });

        await this.createSystemThings(db);
    }

    async createSystemThings(db) {
        await db.query( gql_system );
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

    eachConstraint(iteration) {
        for (let key in this.schemas) {
            let schema = this.schemas[ key ];

            for (let key in schema.tables) {
                let table = schema.tables[key];

                for (let key in table.constraints) {
                    let constraint = table.constraints[key];

                    iteration( constraint, table, schema );
                }
            }
        }
    }

    // table: {
    //     schema: "public",
    //     name: "test",
    //     columns: [
    //         {
    //             name: "id",
    //             type: "serial",
    //             nulls: false,
    //             default: 1
    //         }
    //     ]
    // }
    async createTable(table) {
        let {db} = this;
        let {schema, name, columns} = table;
        let dbSchema = this.schemas[ schema ];
        
        if ( !dbSchema ) {
            await db.query(`
                create schema ${ schema }
            `);

            dbSchema = new DbSchema({name: schema});
            this.schemas[ schema ] = dbSchema;
        }
        
        let dbTable = dbSchema.getTable(name);
        if ( !dbTable ) {
            let columnsSql = columns.map(column => {
                let sql = column.name + " " + column.type;
                
                if ( column.default ) {
                    sql += " default " + column.default;
                }

                if ( column.nulls === false ) {
                    sql += " not null";
                }

                return sql;
            }).join(",");

            await db.query(`
                create table ${ schema }.${ name.toString() } (
                    ${ columnsSql }
                )
            `);

            dbTable = new DbTable({
                name,
                schema
            });

            columns.forEach(data => {
                let column = new DbColumn({
                    name: data.name,
                    default: data.default,
                    type: data.type,
                    nulls: data.nulls,
                    // for tests
                    table: table,
                    schema: schema
                });
    
                dbTable.addColumn( column );
            });

            dbSchema.addTable( table );
        }

        return dbTable;
    }
}

module.exports = DbDatabase;
