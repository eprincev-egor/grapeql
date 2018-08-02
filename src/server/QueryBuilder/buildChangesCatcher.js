"use strict";

const _ = require("lodash");

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

    let $row = {};
    let has$ = false;
    for (let $key in row) {
        if ( $key == "$$old_values" ) {
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
        let old = row.$$old_values,
            prev = {},
            changes = {},
            newRow = {};
        
        for (let key in row) {
            if ( key != "$$old_values" ) {
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
    let tableNameOrAlias = update.as ? update.as.toLowerCase() : tableName;

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

    let columnsSql = updatedColumns.map(column => `'${ column }', ${ column }`).join(",");

    let whereSql = [];
    mainConstraint.columns.forEach(column => {
        whereSql.push(`"$old_values".${column} = ${tableNameOrAlias}.${column}`);
    });
    whereSql = whereSql.join(" and ");
    
    if ( !update.returning ) {
        update.returning = [new Column("*")];
    }
    
    update.returning.push(new Column(`
        (
            select
                json_build_object(
                    ${ columnsSql }
                )
            from ${ tableName } as "$old_values"
            where
                ${ whereSql }
        ) as "$$old_values"
    `));
}

function buildReturning({query, queryBuilder}) {
    let type = queryBuilder.getQueryCommandType(query);

    if ( type == "select" ) {
        return;
    }
    
    if ( type == "update" ) {
        buildUpdateOldValues({
            update: query, 
            queryBuilder
        });
    }

    if ( !query.returning ) {
        query.returning = [new Column("*")];
    }
    
    let tableName = queryBuilder.getQueryTableName(query);
    let tableNameOrAlias = query.as ? query.as.toLowerCase() : tableName;

    let dbTable = queryBuilder.server.database.findTable(tableName);

    for (let key in dbTable.columns) {
        let syntaxColumn = new Column(`${ tableNameOrAlias }.${ key } as "$${ key }"`);

        query.returning.push(syntaxColumn);
        query.addChild(syntaxColumn);
    }
}

module.exports = buildChangesCatcher;