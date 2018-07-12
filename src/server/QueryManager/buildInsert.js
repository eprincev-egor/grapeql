"use strict";

const {getDbTable, value2sql} = require("../../helpers");


function buildInsert({
    queryManager, 
    queryNode, 
    request
}) {
    let row = request.row;


    if ( queryNode.select.from.length > 1 ) {
        throw new Error("can't build insert with many froms");
    }

    let fromItem = queryNode.select.from[0];
    if ( !fromItem.table && !fromItem.file ) {
        throw new Error("fromItem must be table or file");
    }

    if ( fromItem.file ) {
        queryNode = queryManager.getQueryNodeByFile(fromItem.file);
        if ( !queryNode ) {
            throw new Error(`${fromItem.file.toString()} not exists`);
        }

        return buildInsert({
            queryManager, 
            queryNode, 
            request
        });
    }

    let dbTable = getDbTable(queryManager.server, fromItem.table);
    let sql = `insert into ${fromItem.table.toString()} `;  // schema

    let columns = [];
    let values = [];

    row = row || {};
    if ( Object.keys(row).length ) {
        sql += "(";

        for (let key in row) {
            let dbColumn = dbTable.getColumn(key);

            if ( !dbColumn ) {
                throw new Error(`column "${key}" in table "${ dbTable.name }" not exists`);
            }

            columns.push( dbColumn.name );

            let value = row[ key ];
            let sqlValue = value2sql(dbColumn.type, value);
            values.push( sqlValue );
        }

        sql += columns.join(", ");
        sql += ") values (";
        sql += values.join(", ");
        sql += ")";
    } else {
        sql += "default values";
    }

    return sql;
}

module.exports = buildInsert;
