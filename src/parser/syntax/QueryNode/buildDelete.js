"use strict";

const {getNode, getDbTable} = require("../helpers");
const Filter = require("../../../filter/Filter");

module.exports = {
    buildDelete({
        server,
        where
    }) {
        if ( this.select.from.length > 1 ) {
            throw new Error("can't build delete with many froms");
        }

        let fromItem = this.select.from[0];
        if ( !fromItem.table && !fromItem.file ) {
            throw new Error("fromItem must be table or file");
        }

        if ( fromItem.file ) {
            let node = getNode(fromItem.file, server);
            if ( !node ) {
                throw new Error(`${fromItem.file.toString()} not exists`);
            }

            return node.parsed.buildDelete({
                server,
                where
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
};
