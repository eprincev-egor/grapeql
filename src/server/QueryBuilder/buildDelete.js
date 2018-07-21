"use strict";

const {getDbTable} = require("../../helpers");
const Filter = require("../../filter/Filter");

function buildDelete({
    queryBuilder, 
    queryNode, 
    request
}) {
    let where = request.where;
    let server = queryBuilder.server;

    if ( queryNode.select.from.length > 1 ) {
        throw new Error("can't build delete with many sources");
    }

    let fromItem = queryNode.select.from[0];
    if ( !fromItem.table && !fromItem.file ) {
        throw new Error("fromItem must be table or file");
    }

    if ( fromItem.file ) {
        queryNode = queryBuilder.getQueryNodeByFile(fromItem.file);
        if ( !queryNode ) {
            throw new Error(`${fromItem.file.toString()} not exists`);
        }

        return buildDelete({
            queryBuilder, 
            queryNode, 
            request
        });
    }

    let dbTable = getDbTable(server, fromItem.table);
    let sql = "delete from ";
    sql += fromItem.table.toString(); // schema

    if ( where ) {
        where = new Filter(where);

        let columns = where.getColumns();
        let sqlModel = {};
        columns.forEach(key => {
            if ( !/^\w+$/.test(key) ) {
                throw new Error("only native columns allowed in filter");
            }

            let dbColumn = dbTable.getColumn(key);
            if ( !dbColumn ) {
                throw new Error(`column "${key}" in table "${ dbColumn.name }" not exists`);
            }

            sqlModel[ key ] = {
                type: dbColumn.type,
                sql: key
            };
        });

        let whereSql = where.toSql( sqlModel );
        sql += " where " + whereSql;
    }

    return sql;
}

module.exports = buildDelete;