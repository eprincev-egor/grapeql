"use strict";

const _ = require("lodash");

const FromItem = require("../../parser/syntax/FromItem");
const Expression = require("../../parser/syntax/Expression");
const Column = require("../../parser/syntax/Column");


function buildChangesCatcher({
    query, 
    queryBuilder
}) {
    let type = queryBuilder.getQueryCommandType(query);

    buildReturning({query, queryBuilder});

    
    let beforeSql = "";
    let afterSql = "";
    let hasTempTable = false;

    if ( needTempTable(query) ) {
        hasTempTable = true;

        // integer need for save events order 
        beforeSql = `
            create temp table changes (
                table_name text,
                command text,
                result text
            );
        `;

        let withQueries = [];
        query.with.queriesArr.forEach(withItem => {
            if ( withItem.insert ) {
                buildReturning({
                    query: withItem.insert, 
                    queryBuilder
                });

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
                buildReturning({
                    query: withItem.delete, 
                    queryBuilder
                });

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
                buildReturning({
                    query: withItem.update, 
                    queryBuilder
                });

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
            result: removeSystemKeys(result),
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
    if ( type != "select" ) {
        // public.orders
        let table = queryBuilder.getQueryTableName(query);

        let rows = _.isArray(result) ? result : [result];
    
        rows.forEach(row => {
            let changes = row2changes(type, table, row);
            changesStack.push(changes);
        });
    }
    

    return {
        result: removeSystemKeys(result),
        changesStack
    };
}

function removeSystemKeys(result) {
    (_.isArray(result) ? result : [result]).forEach(row => {
        for (let key in row) {
            if ( key[0] == "$" ) {
                delete row[ key ];
            }
        }
    });
    return result;
}

function row2changes(type, table, row) {
    if ( type == "select" ) {
        return;
    }

    if ( type == "update" ) {
        let $row = {};
        let has$ = false;
        for (let $key in row) {
            if ( /^\$old\$/.test($key) ) {
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

        let prev = {},
            changes = {},
            newRow = {};
        
        for (let key in row) {
            if ( /^\$old\$/.test(key) ) {
                continue;
            }
            
            let value = row[ key ];
            prev[ key ] = value;
            newRow[ key ] = value;

            let oldKey = "$old$" + key;
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
        let $row = {};
        let has$ = false;
        for (let $key in row) {
            if ( $key[0] == "$" ) {
                let key = $key.slice(1);
                $row[ key ] = row[ $key ];
                has$ = true;
            }
        }

        if ( has$ ) {
            return {
                type,
                table,
                row: $row
            };
        } else {
            return {
                type,
                table,
                row
            };
        }
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

    let returning = [];
    columnsSql = columnsSql.map(column => {
        let alias = `"$old$${column}"`;

        let returningColumn = new Column(`old_values.${alias}`);
        returning.push(returningColumn);

        return `${column} as ${alias}`;
    });

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
        constraintSql.push(`old_values."$old$${column}" = ${tableNameOrAlias}.${column}`);
    });

    constraintSql = constraintSql.join(" and ");

    update.where = new Expression(constraintSql);

    return returning;
}

function buildReturning({query, queryBuilder}) {
    let type = queryBuilder.getQueryCommandType(query);

    if ( type == "select" ) {
        return;
    }
    
    let oldValuesReturning;
    if ( type == "update" ) {
        oldValuesReturning = buildUpdateOldValues({
            update: query, 
            queryBuilder
        });
    }
    
    if ( !query.returning ) {
        if ( !query.returningAll ) {
            query.returningAll = true;
        }
        return;
    }
    
    let tableName = queryBuilder.getQueryTableName(query);
    let dbTable = queryBuilder.server.database.findTable(tableName);

    for (let key in dbTable.columns) {
        let syntaxColumn = new Column(`${ tableName }.${ key } as "$${ key }"`);

        query.returning.push(syntaxColumn);
        query.addChild(syntaxColumn);
    }

    if ( oldValuesReturning ) {
        oldValuesReturning.forEach(syntaxColumn => {
            query.returning.push(syntaxColumn);
            query.addChild(syntaxColumn);
        });
    }
}

module.exports = buildChangesCatcher;