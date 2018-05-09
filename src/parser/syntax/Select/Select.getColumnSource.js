"use strict";

const {
    PUBLIC_SCHEMA_NAME,
    objectLink2schmeTable,
    objectLink2schmeTableColumn,
    getDbColumn,
    getDbTable
} = require("./helpers");

module.exports = {
    // params.server
    // params.node
    getColumnSource(params, objectLink, options) {
        options = options || {};
        let _childFromItem = options._childFromItem;

        if (
            objectLink.link.length == 1 &&
            options._checkColumns !== false
        ) {
            let column = this.columns.find(column => {
                if ( column.as ) {
                    return column.as.equal( objectLink.link[0] );
                }

                if ( column.expression.isLink() ) {
                    let columnLink = column.expression.getLink();
                    let columnName = columnLink.getLast();

                    if ( columnName != "*" ) {
                        return columnName.equal( objectLink.link[0] );
                    }
                }
            });

            if ( column ) {
                if ( column.expression.isLink() ) {
                    objectLink = column.expression.getLink();
                    return this.getColumnSource(params, objectLink, { _checkColumns: false });
                } else {
                    return {expression: column.expression};
                }
            }
        }

        let sources = [];

        let fromItems = this.from.concat( this.joins.map(join => join.from) );
        for (let i = 0, n = fromItems.length; i < n; i++) {
            let fromItem = fromItems[ i ];

            if ( fromItem == _childFromItem ) {
                break;
            }

            let source;
            if ( fromItem.table ) {
                source = this._getColumnSourceByFromItem(params, fromItem, objectLink);
            }
            else if ( fromItem.select ) {
                let subLink = objectLink.slice(-1);
                source = fromItem.select.getColumnSource(params, subLink);
            }

            if ( source ) {
                sources.push(source);
            }
        }

        if ( sources.length === 0 ) {
            let source = this._findSourceByLateal(params, objectLink);
            if ( source ) {
                return source;
            }

            if ( options.throwError !== false ) {
                throw new Error(`column "${ objectLink.getLast() }" does not exist`);
            }
        }
        if ( sources.length > 1 ) {
            throw new Error(`column reference "${ objectLink.getLast() }" is ambiguous`);
        }

        return sources[0];
    },

    _getColumnSourceByFromItem(params, fromItem, objectLink) {
        let from = objectLink2schmeTable(fromItem.table);
        let link = objectLink2schmeTableColumn( objectLink );

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
            for (let i = 0, n = this.with.length; i < n; i++) {
                let withQuery = this.with[ i ];

                if ( withQuery == _childWithQuery ) {
                    break;
                }

                if ( fromLink.link[0].equal( withQuery.name ) ) {
                    let subLink = link.slice(-1);
                    return withQuery.select.getColumnSource(params, subLink, {throwError: false});
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

    _findSourceByLateal(params, objectLink) {
        let FromItem = this.Coach.FromItem;
        let parentFromItem = this.findParentInstance(FromItem);

        if ( !parentFromItem || !parentFromItem.lateral ) {
            return;
        }

        let Select = this.Coach.Select;
        let parentSelect = parentFromItem.findParentInstance(Select);
        if ( parentSelect ) {
            return parentSelect.getColumnSource(params, objectLink, {_childFromItem: parentFromItem});
        }
    }
};
