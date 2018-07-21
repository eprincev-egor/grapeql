"use strict";

const FromItem = require("../../parser/syntax/FromItem");
const Expression = require("../../parser/syntax/Expression");

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

    let whereSql = update.where ? update.where.toString({pg: true}) : "";
    let columnsSql = updatedColumns.slice();
    mainConstraint.columns.forEach(column => {
        if ( !updatedColumns.includes(column) ) {
            columnsSql.push(column);
        }
    });

    columnsSql = columnsSql.map(column => `${column} as old_${column}`);

    update.from = [new FromItem(`(
        select ${columnsSql}
        from ${tableName}
        where
            ${whereSql}
    ) as old_values`)];

    
    let tableNameOrAlias = update.as ? update.toLowerCase() : tableName;
    
    let constraintSql = [];
    mainConstraint.columns.forEach(column => {
        constraintSql.push(`old_values.old_${column} = ${tableNameOrAlias}.${column}`);
    });

    constraintSql = constraintSql.join(" and ");

    update.where = new Expression(constraintSql);
}

module.exports = buildUpdateOldValues;