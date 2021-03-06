"use strict";

const {
    PUBLIC_SCHEMA_NAME,
    objectLink2schemaTable,
    objectLink2schemaTableColumn,
    getDbColumn,
    getDbTable
} = require("../../../helpers");

module.exports = {
    getColumnSource({
        server, node, link,
        // options
        checkColumns = true,
        throwError = true,
        childFromItem
    }) {
        let objectLink = link;

        if (
            objectLink.link.length == 1 &&
            checkColumns !== false
        ) {
            let column = this.columns.find(column => {
                if ( column.as ) {
                    return column.as.equal( objectLink.link[0] );
                }

                if ( column.expression.isLink() ) {
                    let columnLink = column.expression.getLink();
                    let columnName = columnLink.last();

                    if ( columnName != "*" ) {
                        return columnName.equal( objectLink.link[0] );
                    }
                }
            });

            if ( column ) {
                if ( column.expression.isLink() ) {
                    objectLink = column.expression.getLink();
                    return this.getColumnSource({
                        server, node,
                        link: objectLink,
                        checkColumns: false
                    });
                } else {
                    return {expression: column.expression};
                }
            }
        }

        let sources = [];

        this.eachFromItem(fromItem => {
            if ( fromItem == childFromItem ) {
                return false;
            }

            let source;
            if ( fromItem.table ) {
                source = this._getColumnSourceByFromItem({server, node}, fromItem, objectLink);
            }
            else if ( fromItem.select ) {
                let tableName = objectLink.first();
                let subLink = objectLink.slice(-1);

                if (
                    objectLink.link.length == 1 ||
                    fromItem.as.equal(tableName)
                ) {
                    source = fromItem.select.getColumnSource({server, node, link: subLink});
                }
            }
            else if ( fromItem.file ) {
                let tableName = objectLink.first();
                let subLink = objectLink.slice(-1);
                let queryNode = server.queryBuilder.getQueryNodeByFile(fromItem.file, server);

                if (
                    objectLink.link.length == 1 ||
                    fromItem.as.equal(tableName)
                ) {
                    source = queryNode.select.getColumnSource({server, node, link: subLink});
                }
            }

            if ( source ) {
                sources.push(source);
            }
        });

        if ( sources.length === 0 ) {
            let source = this._findSourceByLateral({server, node}, objectLink);
            if ( source ) {
                return source;
            }

            if ( throwError !== false ) {
                throw new Error(`column "${ objectLink.last() }" does not exist`);
            }
        }
        if ( sources.length > 1 ) {
            throw new Error(`column reference "${ objectLink.last() }" is ambiguous`);
        }

        return sources[0];
    },

    _getColumnSourceByFromItem(params, fromItem, objectLink) {
        let from = objectLink2schemaTable(fromItem.table);
        let link = objectLink2schemaTableColumn( objectLink );

        if ( link.schema ) {
            let fromSchema = from.schemaObject;
            if ( !fromSchema ) {
                fromSchema = new this.Coach.ObjectName(PUBLIC_SCHEMA_NAME);
            }
            if ( !link.schemaObject.equal( fromSchema ) ) {
                return;
            }
        }

        if ( link.table ) {
            if ( fromItem.as ) {
                if ( !fromItem.as.equal( link.tableObject ) ) {
                    return;
                }
            }

            else if ( !from.tableObject.equal( link.tableObject ) ) {
                return;
            }
        }


        if ( fromItem.table.link.length == 1 ) {
            let source = this._findByWithQuery(params, fromItem.table, objectLink);
            if ( source ) {
                return source;
            }
        }

        let dbTable = getDbTable(params.server, fromItem.table);
        let dbColumn = null;
        try {
            dbColumn = getDbColumn(dbTable, objectLink);
        } catch(err) {
            dbColumn = null;
        }

        if ( dbColumn ) {
            return {dbColumn};
        }
    },

    _findByWithQuery(params, fromLink, link, _childWithQuery) {
        if ( this.with ) {
            for (let i = 0, n = this.with.queriesArr.length; i < n; i++) {
                let withQuery = this.with.queriesArr[ i ];

                if ( withQuery == _childWithQuery ) {
                    break;
                }

                if ( fromLink.link[0].equal( withQuery.name ) ) {
                    let subLink = link.slice(-1);

                    if ( withQuery.select ) {
                        return withQuery.select.getColumnSource({
                            server: params.server,
                            node: params.node,
                            link: subLink,
                            throwError: false
                        });
                    }

                    if ( withQuery.values ) {
                        if ( !withQuery.values.length ) {
                            return;
                        }

                        let valueRow = withQuery.values[0];
                        if ( !valueRow.items.length ) {
                            return;
                        }

                        if ( !withQuery.columns ) {
                            return;
                        }

                        if ( subLink.link.length !== 1 ) {
                            return;
                        }

                        let findName = subLink.first();
                        let index = withQuery.columns.findIndex(name => findName.equal(name));
                        if ( index == -1 ) {
                            return;
                        }

                        let valueItem = valueRow.items[ index ];
                        if ( !valueItem.expression ) {
                            return;
                        }

                        return {expression: valueItem.expression};
                    }
                }
            }
        }

        let WithQuery = this.Coach.WithQuery;
        let parentWithQuery = this.findParentInstance(WithQuery);

        if ( parentWithQuery ) {
            let Select = this.Coach.Select;
            let parentSelect = parentWithQuery.findParentInstance(Select);
            return parentSelect._findByWithQuery(params, fromLink, link, parentWithQuery);
        }
    },

    _findSourceByLateral(params, objectLink) {
        let FromItem = this.Coach.FromItem;
        let parentFromItem = this.findParentInstance(FromItem);

        if ( !parentFromItem || !parentFromItem.lateral ) {
            return;
        }

        let Select = this.Coach.Select;
        let parentSelect = parentFromItem.findParentInstance(Select);
        if ( parentSelect ) {
            return parentSelect.getColumnSource({
                server: params.server,
                node: params.node,
                link: objectLink,
                childFromItem: parentFromItem
            });
        }
    }
};
