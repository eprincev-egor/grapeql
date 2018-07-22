"use strict";

const _ = require("lodash");

const FromItem = require("../../parser/syntax/FromItem");
const Expression = require("../../parser/syntax/Expression");


function buildChangesCatcher({
    query, 
    queryBuilder
}) {
    if ( !query.returning && !query.returningAll ) {
        query.returningAll = true;
    }
    
    let type = queryBuilder.getQueryCommandType(query);

    if ( type == "update" ) {
        buildUpdateOldValues({
            update: query, 
            queryBuilder
        });
    }

    let beforeSql = "";
    let afterSql = "";
    let hasTempTable = false;

    if ( needTempTable(query) ) {
        hasTempTable = true;

        beforeSql = `
            create temp table changes (
                table_name text,
                command text,
                result text
            );
        `;

        let index = 0;
        query.with.queriesArr.forEach(withItem => {
            if ( withItem.insert ) {
                withItem.insert.returningAll = true;

                let table = queryBuilder.getQueryTableName(withItem.insert);

                query.with.setWithQuery("tmp" + index, `
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
                withItem.delete.returningAll = true;

                let table = queryBuilder.getQueryTableName(withItem.delete);

                query.with.setWithQuery("tmp" + index, `
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
                buildUpdateOldValues({
                    update: withItem.update, 
                    queryBuilder
                });

                let table = queryBuilder.getQueryTableName(withItem.update);

                query.with.setWithQuery("tmp" + index, `
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

        afterSql = `
            ;
            select *
            from changes;
        `;
    }

    let sql = query.toString({ pg: true });
    sql = beforeSql + sql;
    sql = sql + afterSql;

    return {
        sql,
        prepareResult: prepareResult.bind(null, {
            hasTempTable,
            query,
            type,
            queryBuilder
        })
    };
}

function prepareResult({
    hasTempTable,
    query,
    type,
    queryBuilder
}, result) {
    let selectChangesResult;

    if ( hasTempTable ) {
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
        type != "insert" &&
        type != "update" &&
        type != "delete" &&
        !selectChangesResult
    ) {
        return {
            result,
            changesStack: []
        };
    }

    let changesStack = [];

    if ( ["insert", "update", "delete"].includes(type) ) {
        // public.orders
        let table = queryBuilder.getQueryTableName(query);

        let rows = _.isArray(result) ? result : [result];
    
        rows.forEach(row => {
            let changes = row2changes(type, table, row);
            changesStack.push(changes);
        });
    }
    

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

    return {
        result,
        changesStack
    };
}

function row2changes(type, table, row) {
    if ( type == "select" ) {
        return;
    }

    if ( type == "update" ) {
        let prev = {},
            changes = {},
            newRow = {};
        
        for (let key in row) {
            if ( /old_/.test(key) ) {
                continue;
            }
            
            let value = row[ key ];
            prev[ key ] = value;
            newRow[ key ] = value;

            let oldKey = "old_" + key;
            if ( oldKey in row ) {
                let oldValue = row[ oldKey ];
                
                if ( oldValue != value ) {
                    changes[ key ] = value;
                    prev[ key ] = oldValue;
                }
            }
        }

        return {
            type,
            table,
            row: newRow,
            changes,
            prev
        };
    } else {
        return {
            type,
            table,
            row
        };
    }
}

function needTempTable(query) {
    if ( !query.with ) {
        return;
    }
    
    return query.with.queriesArr.some(withItem => withItem.update || withItem.insert || withItem.delete);
}

function buildUpdateOldValues({update, queryBuilder}) {
    let tableName = queryBuilder.getQueryTableName(update);

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
    update.set.forEach(setItem => {
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

    let whereSql = update.where ? update.where.toString({pg: true}) : false;

    let columnsSql = updatedColumns.slice();
    mainConstraint.columns.forEach(column => {
        if ( !updatedColumns.includes(column) ) {
            columnsSql.push(column);
        }
    });

    columnsSql = columnsSql.map(column => `${column} as old_${column}`);

    if ( whereSql ) {
        update.from = [new FromItem(`(
            select ${columnsSql}
            from ${tableName}
            where
                ${whereSql}
        ) as old_values`)];
    } else {
        update.from = [new FromItem(`(
            select ${columnsSql}
            from ${tableName}
        ) as old_values`)];
    }

    
    let tableNameOrAlias = update.as ? update.toLowerCase() : tableName;
    
    let constraintSql = [];
    mainConstraint.columns.forEach(column => {
        constraintSql.push(`old_values.old_${column} = ${tableNameOrAlias}.${column}`);
    });

    constraintSql = constraintSql.join(" and ");

    update.where = new Expression(constraintSql);
}

module.exports = buildChangesCatcher;