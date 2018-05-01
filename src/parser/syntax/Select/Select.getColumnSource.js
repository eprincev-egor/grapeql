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

        let link = objectLink2schmeTableColumn( objectLink );

        if ( !link.table && options._checkColumns !== false ) {
            let column = this.columns.find(column => {
                let alias = column.as;
                alias = alias && (alias.word || alias.content);

                if ( !alias && column.expression.isLink() ) {
                    let objectLink = column.expression.getLink();
                    let tmpLink = objectLink2schmeTableColumn( objectLink );

                    if ( link.column == tmpLink.column ) {
                        return true;
                    }
                }

                if ( alias == link.column ) {
                    return true;
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
                source = this._getColumnSourceByFromItem(params, fromItem, link);
            }
            else if ( fromItem.select ) {
                let subLink = new this.Coach.ObjectLink();
                subLink.add( link.columnObject.clone() );

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
                throw new Error(`column "${ link.column }" does not exist`);
            }
        }
        if ( sources.length > 1 ) {
            throw new Error(`column reference "${ link.column }" is ambiguous`);
        }

        return sources[0];
    },

    _getColumnSourceByFromItem(params, fromItem, link) {
        let from = objectLink2schmeTable(fromItem.table);

        if ( link.schema ) {
            if ( (from.schema || PUBLIC_SCHEMA_NAME) != link.schema ) {
                return;
            }
        }

        if ( link.table ) {
            if ( fromItem.as ) {
                let alias = fromItem.as;
                alias = alias.word || alias.content;

                if ( alias != link.table ) {
                    return;
                }
            }

            else if ( from.table != link.table ) {
                return;
            }
        }

        if ( !from.schema ) {
            let source = this._findByWithQuery(params, from, link);
            if ( source ) {
                return source;
            }
        }

        let dbTable = getDbTable(params.server, from);
        let dbColumn = null;
        try {
            dbColumn = getDbColumn(dbTable, link);
        } catch(err) {
            dbColumn = null;
        }

        if ( dbColumn ) {
            return {dbColumn};
        }
    },

    _findByWithQuery(params, from, link, _childWithQuery) {
        if ( this.with ) {
            for (let i = 0, n = this.with.length; i < n; i++) {
                let withQuery = this.with[ i ];

                if ( withQuery == _childWithQuery ) {
                    break;
                }

                let name = withQuery.name;
                name = name.word || name.content;

                if ( name == from.table ) {
                    let subLink = new this.Coach.ObjectLink();
                    subLink.add( link.columnObject.clone() );

                    return withQuery.select.getColumnSource(params, subLink, {throwError: false});
                }
            }
        }

        let WithQuery = this.Coach.WithQuery;
        let parentWithQuery = this.findParentInstance(WithQuery);

        if ( parentWithQuery ) {
            let Select = this.Coach.Select;
            let parentSelect = parentWithQuery.findParentInstance(Select);
            return parentSelect._findByWithQuery(params, from, link, parentWithQuery);
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
