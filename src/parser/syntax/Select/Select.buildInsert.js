"use strict";

const {getNode, getDbTable} = require("./helpers");
const {
    isSqlNumber,
    isLikeNumber,
    isSqlText,
    isLikeText,
    isSqlDate,
    isLikeDate,
    wrapText,
    wrapDate,
    isLikeBoolean,
    isSqlBoolean
} = require("../../../helpers");

module.exports = {
    buildInsert({
        server,
        row
    }) {
        if ( this.from.length > 1 ) {
            throw new Error("can't build insert with many froms");
        }

        let fromItem = this.from[0];
        if ( !fromItem.table && !fromItem.file ) {
            throw new Error("fromItem must be table or file");
        }

        if ( fromItem.file ) {
            let node = getNode(fromItem.file, server);
            if ( !node ) {
                throw new Error(`${fromItem.file.toString()} not exists`);
            }

            return node.parsed.buildInsert({server, row});
        }

        let dbTable = getDbTable(server, fromItem.table);
        let sql = `insert into ${fromItem.table.toString()} `;  // schema

        let columns = [];
        let values = [];

        row = row || {};
        if ( Object.keys(row).length ) {
            sql += "(";

            for (let key in row) {
                let dbColumn = dbTable.getColumn(key);

                if ( !dbColumn ) {
                    throw new Error(`column "${key}" in table "${ dbColumn.name }" not exists`);
                }

                columns.push( dbColumn.name );

                let value = row[ key ];
                if ( value == null ) {
                    values.push("null");
                } else {
                    if ( isSqlNumber(dbColumn.type) ) {

                        if ( isLikeNumber(value)  ) {
                            values.push(value);
                        } else {
                            throw new Error("invalid value for number: " + value);
                        }
                    }

                    else if ( isSqlText(dbColumn.type) ) {
                        if ( isLikeText(value) ) {
                            values.push( wrapText(value) );
                        } else {
                            throw new Error("invalid value for text: " + value);
                        }
                    }

                    else if ( isSqlDate(dbColumn.type) ) {
                        if ( isLikeDate(value) ) {
                            values.push( wrapDate(value, dbColumn.type) );
                        } else {
                            throw new Error("invalid value for date: " + value);
                        }
                    }

                    else if ( isSqlBoolean(dbColumn.type) ) {
                        if ( isLikeBoolean(value) ) {
                            if ( value ) {
                                values.push("true");
                            } else {
                                values.push("false");
                            }
                        } else {
                            throw new Error("invalid value for boolean: " + value);
                        }
                    }

                    else {
                        throw new Error(`unsoperted type "${ dbColumn.type } for insert`);
                    }
                }
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
};
