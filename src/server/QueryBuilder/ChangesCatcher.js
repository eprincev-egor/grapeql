"use strict";

const _ = require("lodash");

class ChangesCatcher {
    constructor(queryBuilder) {
        this.queryBuilder = queryBuilder;
    }

    build(query) {
        this.query = query;

        let beforeSql = "";
        let afterSql = "";

        if ( this.needTempTable() ) {
            this.hasTempTable = true;

            // integer need for save events order 
            beforeSql = `
                create temp table changes (
                    table_name text,
                    command text,
                    result text
                );
            `;
            afterSql = `
                ;
                select *
                from changes;
            `;
        }

        this.buildCatchChangesInWithQueries();
        this.buildReturning(query);
        
        if ( query.commandType == "delete" ) {
            this.buildDeleteCascade(query);
        }

        let sql = query.toString({ pg: true });
        sql = beforeSql + sql;
        sql = sql + afterSql;

        return sql;
    }

    prepareResult(result) {
        let {query, queryBuilder} = this;
        let type = query.commandType;

        let selectChangesResult;

        if ( this.hasTempTable ) {
            selectChangesResult = result[2];
            result = result[1];
        }
    
        // next syntax must return an object:
        // select row
        // insert row
        // update row
        // delete row
        if ( query.returningObject ) {
            if ( !result.rows || !result.rows.length ) {
                result = null;
            }
    
            else if ( result.rows.length === 1 ) {
                result = result.rows[0];
            }
        } else {
            result = result.rows || [];
        }
        
    
        
        if ( 
            !result ||
            !type &&
            !selectChangesResult
        ) {
            return {
                result: this.removeSystemKeys(result),
                changesStack: []
            };
        }
    
        let changesStack = [];
        
        // inserted rows in with query, must be first in changes stack
        if ( selectChangesResult ) {
            selectChangesResult.rows.forEach(row => {
                let type = row.command;
                let table = row.table_name;
                let result = row.result;
    
                row = JSON.parse(result);
                let changes = row2changes(type, table, row);
    
                changesStack.push(changes);
            });
        }
    
        // insert/update/delete
        if ( type ) {
            // public.orders
            let table = queryBuilder.getQueryTableName(query);
    
            let rows = _.isArray(result) ? result : [result];
        
            rows.forEach(row => {
                let changes = row2changes(type, table, row);
                changesStack.push(changes);
            });
        }
        
    
        return {
            result: this.removeSystemKeys(result),
            changesStack
        };
    }

    removeSystemKeys(result) {
        (_.isArray(result) ? result : [result]).forEach(row => {
            for (let key in row) {
                if ( key[0] == "$" ) {
                    delete row[ key ];
                }
            }
        });
        return result;
    }

    needTempTable() {
        let query = this.query;

        if ( !query.with ) {
            return;
        }
        
        return query.with.queriesArr.some(withItem => withItem.update || withItem.insert || withItem.delete);
    }

    buildInsertOnConflict(subQuery) {
        // xmax is system column
        // xmax need for identify event - insert or update
        // if xmax equal zero then it was insert
        subQuery.addReturning("xmax as \"$$xmax\"");
        // catch old values
        this.buildUpdateOldValues(subQuery);
    }

    buildReturning(subQuery) {
        let type = subQuery.commandType;
        let {queryBuilder} = this;

        if ( !type ) {
            return;
        }
        
        if ( !subQuery.returning ) {
            subQuery.addReturning("*");
        }
        
        if ( type == "update" ) {
            this.buildUpdateOldValues(subQuery);
        }

        if ( type == "insert" ) {
            if ( subQuery.onConflict && subQuery.onConflict.updateSet ) {
                this.buildInsertOnConflict(subQuery);
            }
        }
        
        let tableName = queryBuilder.getQueryTableName(subQuery);
        let tableNameOrAlias = subQuery.as ? subQuery.as.toLowerCase() : tableName;

        let dbTable = queryBuilder.server.database.findTable(tableName);

        for (let key in dbTable.columns) {
            subQuery.addReturning(
                `${ tableNameOrAlias }.${ key } as "$${ key }"`
            );
        }
    }

    buildUpdateOldValues(subQuery) {
        let {queryBuilder} = this;

        let tableName = queryBuilder.getQueryTableName(subQuery);
        let tableNameOrAlias = subQuery.as ? subQuery.as.toLowerCase() : tableName;
    
        let dbTable = queryBuilder.server.database.findTable(tableName);
        if ( !dbTable ) {
            throw new Error(`table name not found: ${tableName}`);
        }
    
        let mainConstraint;
        for (let key in dbTable.constraints) {
            let constraint = dbTable.constraints[ key ];
            
            if ( constraint.type == "primary key" ) {
                mainConstraint = constraint;
            }
            
            if ( constraint.type == "unique" ) {
                if ( !mainConstraint ) {
                    mainConstraint = constraint;
                }
            }
        }
    
        if ( !mainConstraint ) {
            throw new Error(`expected primary key or unique constraint for table: ${tableName}`);
        }
    
        let updatedColumns = [];
    
        let setItems = subQuery.commandType == "insert" ? 
            subQuery.onConflict.updateSet :
            subQuery.set;
    
        setItems.forEach(setItem => {
            if ( setItem.column ) {
                updatedColumns.push(
                    setItem.column.toLowerCase()
                );
            } else {
                setItem.columns.forEach(column => {
                    updatedColumns.push(
                        column.toLowerCase()
                    );
                });
            }
        });
    
        let columnsSql = updatedColumns.map(column => `'${ column }', ${ column }`).join(",");
    
        let whereSql = [];
        mainConstraint.columns.forEach(column => {
            whereSql.push(`"$old_values".${column} = ${tableNameOrAlias}.${column}`);
        });
        whereSql = whereSql.join(" and ");
        
        if ( !subQuery.returning ) {
            subQuery.addReturning("*");
        }
        
        subQuery.addReturning(`
            (
                select
                    json_build_object(
                        ${ columnsSql }
                    )
                from ${ tableName } as "$old_values"
                where
                    ${ whereSql }
            ) as "$$old_values"
        `);
    }
    
    buildCatchChangesInWithQueries() {
        let {query, queryBuilder} = this;

        if ( !query.with ) {
            return;
        }

        let withQueries = [];
        query.with.queriesArr.forEach(withItem => {
            if ( withItem.insert ) {
                this.buildReturning(withItem.insert);

                let table = queryBuilder.getQueryTableName(withItem.insert);

                withQueries.push(`
                    insert into changes (
                        table_name,
                        command,
                        result
                    )
                    select
                        '${ table }',
                        'insert',
                        row_to_json( tmp_row )::text
                    from ${withItem.name} as tmp_row
                `);
            }

            else if ( withItem.delete ) {
                this.buildReturning(withItem.delete);

                let table = queryBuilder.getQueryTableName(withItem.delete);

                withQueries.push(`
                    insert into changes (
                        table_name,
                        command,
                        result
                    )
                    select
                        '${ table }',
                        'delete',
                        row_to_json( tmp_row )::text
                    from ${withItem.name} as tmp_row
                `);
            }

            else if ( withItem.update ) {
                this.buildReturning(withItem.update);

                let table = queryBuilder.getQueryTableName(withItem.update);

                withQueries.push(`
                    insert into changes (
                        table_name,
                        command,
                        result
                    )
                    select
                        '${ table }',
                        'update',
                        row_to_json( tmp_row )::text
                    from ${withItem.name} as tmp_row
                `);
            }
        });

        // postgres executing with queries in reverse order
        for (let i = withQueries.length - 1; i >= 0; i--) {
            let sql = withQueries[i];
            query.with.setWithQuery("tmp" + i, sql);
        }

    }

    buildDeleteCascade(/* {query} */) {

    }
}

function row2changes(type, table, row) {
    if ( type == "select" ) {
        return;
    }

    let $row = {};
    let has$ = false;
    for (let $key in row) {
        if ( $key == "$$old_values" || $key == "$$xmax" ) {
            $row[ $key ] = row[ $key ];
        }
        else if ( $key[0] == "$" ) {
            let key = $key.slice(1);
            $row[ key ] = row[ $key ];
            has$ = true;
        }
    }
    if ( has$ ) {
        row = $row;
    }

    if ( type == "update" ) {
        return getUpdateChanges({
            row,
            table
        });
    } else {
        if ( "$$xmax" in row ) {
            let xmax = row.$$xmax;
            delete row.$$xmax;
            
            if ( xmax == "0" ) {
                delete row.$$old_values;
                return {
                    type,
                    table,
                    row
                };
            } else {
                return getUpdateChanges({
                    row,
                    table
                });
            }
        } else {
            return {
                type,
                table,
                row
            };
        }
    }
}

function getUpdateChanges({table, row}) {
    let old = row.$$old_values,
        prev = {},
        changes = {},
        newRow = {};

    for (let key in row) {
        if ( key != "$$old_values" && key != "$$xmax" ) {
            prev[ key ] = newRow[ key ] = row[ key ];
        }
    }

    for (let key in old) {
        let newValue = row[ key ];
        let oldValue = old[ key ];

        if ( newValue != oldValue ) {
            changes[ key ] = newValue;
            prev[ key ] = oldValue;
        }
    }

    return {
        type: "update",
        table,
        row: newRow,
        changes,
        prev
    };
}





module.exports = ChangesCatcher;