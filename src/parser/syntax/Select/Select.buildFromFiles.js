"use strict";

const _grape_query_columns = "_grape_query_columns";

function getFromItemName(fromItem) {
    if ( fromItem.as && fromItem.as.alias ) {
        let alias = fromItem.as.alias;
        return alias.word || alias.content;
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

        select.buildFromFiles({
            server,
            usedColumns
        });

        let columnExpressionByKey = {};
        usedColumns.forEach(key => {
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
                        as.alias.word && as.alias.word.toLowerCase() == key.toLowerCase() ||
                        as.alias.content && as.alias.content == key
                    ) {
                        return column;
                    }
                }
            });

            if ( findedColumn ) {
                columnExpressionByKey[ key ] = findedColumn.expression.toString();
            } else {
                if ( !/\./.test(key) && select.from.length === 1 ) {
                    let fromItem = select.from[0];
                    if ( fromItem.as && fromItem.as.alias ) {
                        columnExpressionByKey[ key ] = `${ fromItem.as.alias.toString() }."${ key }"`;
                    }
                    else if ( fromItem.table ) {
                        columnExpressionByKey[ key ] = `${ fromItem.table.toString() }."${ key }"`;
                    }
                } else {
                    columnExpressionByKey[ key ] = `${ key }`;
                }
            }
        });

        select.clearColumns();


        params.columns.forEach(key => {
            let columnSql = `${ _grape_query_columns }."${ key }"`;
            select.addColumn(columnSql);
        });


        let columnsSql = [];
        usedColumns.forEach(key => {
            let sql = columnExpressionByKey[ key ];
            columnsSql.push(`  ${ sql } as "${ key }"`);
        });

        let join = select.addJoin(`left join lateral ( select\n\n${ columnsSql.join(",\n") }\n\n) as ${ _grape_query_columns } on true`);

        let sqlModel = {};
        if ( where ) {
            join.from.select.columns.forEach(column => {
                let key = column.as.alias;
                key = key.word || key.content;

                sqlModel[ key ] = {
                    sql: `${ _grape_query_columns }."${ key }"`,
                    type: column.expression.getType({
                        server,
                        node: params.node
                    })
                };
            });
        }

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
        let select = this;
        let usedColumns = params.usedColumns;
        let server = params.server;

        for (let i = select.joins.length - 1; i >= 0; i--) {
            let join = select.joins[ i ];

            if ( !join.from.file ) {
                continue;
            }

            let name = getFromItemName( join.from );
            if ( usedColumns.some(column => column.indexOf(name + ".") === 0 ) ) {
                let node = getNodeByPath( server, join.from.file.path );
                if ( !node ) {
                    throw new Error(`Node ${ join.from.file.toString() } does not exist`);
                }

                let nodeSelect = node.parsed.clone();
                let as = join.from.as;
                join.from = nodeSelect.from[0].clone();

                if ( as ) {
                    join.from.as = as.clone();
                }
            } else {
                select.joins.splice(i, 1);
            }
        }

    }
};
