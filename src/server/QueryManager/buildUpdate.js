"use strict";

const {getDbTable, value2sql} = require("../../helpers");
const ObjectLink = require("../../parser/syntax/ObjectLink");
const buildSelect = require("./buildSelect");

function buildUpdate({
    queryManager, 
    queryNode, 
    request
}) {
    let set = request.set;
    let where = request.where;

    let columns = Object.keys(set);
    let select = buildSelect({
        queryManager, 
        queryNode,
        request: {
            columns,
            where
        }
    });

    let fromItems = [];
    let columnsByIndex = [];
    let valuesByIndex = [];

    columns.forEach(columnLink => {
        let value = set[ columnLink ];
        let key = columnLink;
        if ( /\./.test(key) ) {
            key = columnLink.split(".").slice(-1)[0];
        }

        let fromItem = _getFromItemByColumnKey({select, columnLink});
        let dbColumn = _getDbColumnByColumnLink({
            queryManager, fromItem,
            columnLink, key
        });


        let index = fromItems.indexOf(fromItem);
        if ( index == -1 ) {
            index = fromItem.length;
            fromItems.push( fromItem );
            columnsByIndex.push([ dbColumn ]);
            valuesByIndex.push([ value ]);
        } else {
            columnsByIndex[ index ].push( dbColumn );
            valuesByIndex[ index ].push( value );
        }
    });

    let outSql = [];
    columnsByIndex.forEach((columns, i) => {
        let values = valuesByIndex[i];

        let tableName = columns[0].table;
        let sql = `update ${tableName} set `;

        columns.forEach((dbColumn, i) => {
            let value = values[i];

            sql += dbColumn.name;
            sql += " = ";
            sql += value2sql( dbColumn.type, value );
        });

        sql += " where " + select.where.toString();

        outSql.push(sql);
    });

    return outSql.join("; ");
}

function _getDbColumnByColumnLink({
    queryManager, fromItem,
    columnLink, key
}) {
    if ( !fromItem.table ) {
        throw new Error(`imposible build update for key: ${columnLink}`);
    }

    let dbTable = getDbTable(queryManager.server, fromItem.table);
    let dbColumn = dbTable.getColumn(key);

    if ( !dbColumn ) {
        throw new Error(`column "${key}" in table "${ dbTable.name }" not exists`);
    }

    return dbColumn;
}

function _getFromItemByColumnKey({select, columnLink}) {
    let base = columnLink.split(".").slice(0, -1).join(".");
    if ( !base ) {
        return select.from[0];
    }

    let link = new ObjectLink(base);
    let outFromItem;

    select.eachFromItem(fromItem => {
        let tableLink = fromItem.toTableLink();

        if ( tableLink.equalLink(link) ) {
            outFromItem = fromItem;
            return false;
        }
    });

    return outFromItem;
}

module.exports = buildUpdate;
