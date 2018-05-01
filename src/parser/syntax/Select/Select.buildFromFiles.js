"use strict";

function getFromItemName(fromItem) {
    if ( fromItem.as ) {
        return fromItem.as.word || fromItem.as.content;
    }
    else if ( fromItem.table ) {
        let link = fromItem.table.link;
        let name = link[ link.length - 1 ];
        return name.word || name.content;
    }
}

function getNodeByPath(server, path) {
    path = path.map(elem => elem.toString()).join("/");
    path = path.replace(/\.sql$/, "").replace(/[/.]/g, "");

    for (let name in server.nodes) {
        if ( name == path ) {
            return server.nodes[ name ];
        }
    }
}

function getJoinName(join) {

}

module.exports = {
    // params.node
    // params.server
    // params.columns
    // params.offset
    // params.limit
    // params.where
    build(params) {
        let server = params.server;
        let where = params.where;
        let select = this.clone();

        let usedColumns = params.columns.slice();
        if ( where ) {
            let filterColumns = where.getColumns();
            filterColumns.forEach(key => {
                if ( !usedColumns.includes(key) ) {
                    usedColumns.push(key);
                }
            });
        }

        this.buildFromFiles({
            select,
            server,
            usedColumns
        });

        let columnExpressionByKey = {};
        usedColumns.forEach(key => {
            if ( !/\./.test(key) ) {
                if ( select.from.length !== 1 ) {
                    throw new Error(`column '${ key }' can use only for selects with single 'from'`);
                }
            }


            let findedColumn = select.columns.find(column => {
                let as = column.as;

                if ( !as ) {
                    if ( column.expression.isLink() ) {
                        let link = column.expression.getLink();
                        let last = link.getLast();

                        if (
                            last.word && last.word.toLowerCase() == key.toLowerCase() ||
                            last.content && last.content == key
                        ) {
                            return column;
                        }
                    }
                } else {
                    if (
                        as.word && as.word.toLowerCase() == key.toLowerCase() ||
                        as.content && as.content == key
                    ) {
                        return column;
                    }
                }
            });

            if ( findedColumn ) {
                columnExpressionByKey[ key ] = findedColumn.expression.toString();
            } else {
                if ( !/\./.test(key) ) {
                    let fromItem = select.from[0];
                    if ( fromItem.as ) {
                        columnExpressionByKey[ key ] = `${ fromItem.as.toString() }."${ key }"`;
                    }
                    else if ( fromItem.table ) {
                        columnExpressionByKey[ key ] = `${ fromItem.table.toString() }."${ key }"`;
                    }
                } else {
                    let sql = key.split(".");
                    if ( sql.length > 1 ) {
                        sql = "\"" + sql.slice(0, -1).join(".") + "\"." + sql.slice(-1)[0];
                        columnExpressionByKey[ key ] = sql;
                    } else {
                        columnExpressionByKey[ key ] = key;
                    }
                }
            }
        });

        select.clearColumns();

        let sqlModel = {};
        usedColumns.forEach(key => {
            let expressionSql = columnExpressionByKey[key];
            let columnSql = `${ expressionSql } as "${ key }"`;
            let column = select.addColumn(columnSql);

            sqlModel[ key ] = {
                sql: expressionSql,
                type: column.expression.getType({
                    server,
                    node: params.node
                })
            };

            if ( !params.columns.includes(key) ) {
                select.removeColumn(column);
            }
        });

        if ( params.limit != null && params.limit != "all" ) {
            select.setLimit(params.limit);
        }
        if ( params.offset != null && params.offset > 0 ) {
            select.setOffset(params.offset);
        }

        if ( where ) {
            let whereSql = where.toSql( sqlModel );
            select.addWhere( whereSql );
        }

        select.removeUnnesaryJoins({ server });

        return select;
    },

    buildFromFiles(params) {
        let select = params.select;
        let usedColumns = params.usedColumns;
        let server = params.server;

        let fromNames = {};
        let nativeKeys = {};

        usedColumns.forEach(key => {
            key = key.toLowerCase();

            if ( /\./.test(key) ) {
                let fromName = key.split(".")[0];

                if ( !(fromName in fromNames) ) {
                    fromNames[ fromName ] = [];
                }

                fromNames.push
            } else {
                nativeKeys[ key ] = true;
            }
        });

        nativeKeys = Object.keys( nativeKeys );

        for (let i = this.joins.length - 1; i >= 0; i--) {
            let join = this.joins[ i ];
            let joinName = getJoinName( join );

            if ( !(joinName in fromNames) ) {
                continue;
            }

            if ( !join.from.file ) {
                select.addJoin( join.toString() );
            }
        }
    }
};
