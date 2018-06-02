"use strict";

const {getNode} = require("./helpers");

module.exports = {
    build({
        node,
        server,
        columns,
        where,
        orderBy,
        offset,
        limit
    }) {
        let select = this.clone();

        select.buildColumns({
            columns,
            originalSelect: this
        });

        if ( where ) {
            select.buildWhere({
                where,
                originalSelect: this,
                node,
                server
            });
        }

        if ( orderBy ) {
            select.buildOrderBy({
                orderBy,
                originalSelect: this
            });
        }

        select.removeUnnesaryJoins({ server });
        select.buildFromFiles({ server });

        if ( limit != null && limit != "all" ) {
            select.setLimit(limit);
        }

        if ( offset != null && offset > 0 ) {
            select.setOffset(offset);
        }

        return select;
    },

    buildColumns({originalSelect, columns}) {
        this.clearColumns();

        columns.forEach(key => {
            let keyParts = key.split(".");

            let definedColumn = originalSelect.getColumnByAlias( key );
            if ( definedColumn ) {
                if ( definedColumn.expression.isLink() ) {
                    let link = definedColumn.expression.getLink();
                    let last = link.getLast();

                    if ( last.strictEqualString(key) ) {
                        this.addColumn(`${ definedColumn.expression }`);
                        return;
                    }
                }

                this.addColumn(`${ definedColumn.expression } as "${ key }"`);
                return;
            }

            let columnKey = key;
            let fromItem;
            if ( keyParts.length > 1 ) {
                fromItem = this.getFromItemByAlias( keyParts[0] );
                columnKey = keyParts.slice(-1)[0];
            } else {
                fromItem = this.from[0];
            }

            if ( columnKey == key ) {
                let fromSql = fromItem.getAliasSql();
                this.addColumn(`${ fromSql }.${ columnKey }`);
            } else {
                this.addColumn(`${ key } as "${ key }"`);
            }
        });
    },

    buildColumnExpression(key) {
        let keyParts = key.split(".");

        let definedColumn = this.getColumnByAlias( key );
        if ( definedColumn ) {
            return definedColumn.expression.toString();
        }

        let columnKey = key;
        let fromItem;
        if ( keyParts.length > 1 ) {
            fromItem = this.getFromItemByAlias( keyParts[0] );
            columnKey = keyParts.slice(-1)[0];
        } else {
            fromItem = this.from[0];
        }

        if ( columnKey == key ) {
            let fromSql = fromItem.getAliasSql();
            return `${ fromSql }.${ columnKey }`;
        } else {
            return key;
        }
    },

    buildWhere({where, originalSelect, node, server}) {
        let sqlModel = {};
        let filterColumns = where.getColumns();
        filterColumns.forEach(key => {
            if ( key in sqlModel ) {
                return;
            }

            let expression = originalSelect.buildColumnExpression(key);
            let type = originalSelect.getExpressionType({
                expression,
                node,
                server
            });
            sqlModel[ key ] = {
                sql: expression,
                type
            };
        });

        let whereSql = where.toSql( sqlModel );
        this.addWhere( whereSql );
    },

    buildOrderBy({orderBy, originalSelect}) {
        if ( typeof orderBy == "string" ) {
            orderBy = [orderBy];
        }

        if ( !orderBy.length ) {
            throw new Error("orderBy must be array like are ['id', 'desc'] or [['name', 'asc'], ['id', 'desc']]");
        }

        if ( typeof orderBy[0] == "string" ) {
            orderBy = [orderBy];
        }

        for (let n = orderBy.length, i = n - 1; i >= 0; i--) {
            let elem = orderBy[i];
            let key = elem[0];
            let vector = elem[1] || "asc";

            if ( typeof key != "string" ) {
                throw new Error("invalid orderBy key");
            }
            if ( typeof vector != "string" ) {
                throw new Error("invalid orderBy vector");
            }

            vector = vector.toLowerCase();
            if ( vector != "asc" && vector != "desc" ) {
                throw new Error("invalid orderBy vector: " + vector);
            }

            let expression = originalSelect.buildColumnExpression(key);
            this.unshiftOrderByElement(`${ expression } ${ vector }`);
        }
    },

    getExpressionType({expression, node, server}) {
        expression = new this.Coach.Expression(expression);
        expression.parent = this;

        let type = expression.getType({
            node,
            server
        });

        delete expression.parent;
        return type;
    },

    buildFromFiles({ server }) {
        let fromItems = this._getFromFiles();
        if ( !fromItems.length ) {
            return;
        }

        fromItems.forEach(fromItem => {
            this._buildFromFile({
                server,
                fromItem
            });
        });
        this.removeUnnesaryJoins({ server });

        this.buildFromFiles({ server });
    },

    _buildFromFile({ server, fromItem }) {
        const ObjectName = this.Coach.ObjectName;
        const Join = this.Coach.Join;
        const Select = this.Coach.Select;

        let isJoin = fromItem.parent instanceof Join;
        let isManyFrom = (
            fromItem.parent instanceof Select &&
            fromItem.parent.from.length > 1
        );

        let node = getNode(fromItem.file, server);
        let nodeFrom = node.parsed.from[0];

        let oldNodeAlias = nodeFrom.getAliasSql();
        let newNodeAlias = fromItem.as || fromItem.file.toObjectName();

        fromItem.clear({ joins: false });
        nodeFrom.fillClone(fromItem, { joins: false });
        fromItem.as = newNodeAlias;

        let joins = [];
        for (let j = 0, m = nodeFrom.joins.length; j < m; j++) {
            let join = nodeFrom.joins[ j ];
            join = join.clone();

            let oldAlias = join.from.getAliasSql();
            let newAliasWithoutQuotes;
            if ( isJoin || isManyFrom ) {
                newAliasWithoutQuotes = `${ trimQuotes( newNodeAlias.toString() ) }.${ trimQuotes( oldAlias ) }`;
            } else {
                newAliasWithoutQuotes = `${ trimQuotes( oldAlias ) }`;
            }

            let newAlias;
            if ( /^\w+$/.test(newAliasWithoutQuotes) ) {
                newAlias = newAliasWithoutQuotes;
            } else {
                newAlias = `"${ newAliasWithoutQuotes }"`;
            }

            join.from.as = new ObjectName(newAlias);

            join.replaceLink(oldNodeAlias, newNodeAlias);
            if ( oldAlias != newAlias ) {
                join.replaceLink(oldAlias, newAlias);
                this.replaceLink(newAliasWithoutQuotes, newAlias);
            }

            if ( isJoin || isManyFrom ) {
                this.replaceLink(`${ newNodeAlias.toString() }.${ trimQuotes( oldAlias ) }`, newAlias);
            } else {
                if ( newAlias != oldAlias ) {
                    this.replaceLink(`${ trimQuotes( oldAlias ) }`, newAlias);
                }
            }

            joins.push({
                join,
                oldAlias,
                newAlias
            });
        }

        let prevJoin = false;
        for (let i = 0, n = joins.length; i < n; i++) {
            let {
                join,
                oldAlias,
                newAlias
            } = joins[ i ];

            fromItem.addJoinAfter(join, prevJoin);
            prevJoin = join;

            for (let j = i + 1; j < n; j++) {
                let nextJoin = joins[ j ].join;

                nextJoin.replaceLink(oldAlias, newAlias);
            }
        }
    },

    _getFromFiles() {
        let fromItems = [];

        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[ i ];

            if ( fromItem.file ) {
                fromItems.push(fromItem);
            }

            fromItem.eachJoin(join => {
                if ( !join.from.file ) {
                    return;
                }

                fromItems.push( join.from );
            });
        }

        return fromItems;
    },

    addWhere(sql) {
        if ( this.where ) {
            sql = `( ${ this.where } ) and ${ sql }`;
            this.removeChild( this.where );
        }

        let coach = new this.Coach(sql);
        coach.skipSpace();

        this.where = coach.parseExpression();
        this.addChild(this.where);
    },

    unshiftOrderByElement(sql) {
        if ( !this.orderBy ) {
            this.orderBy = [];
        }
        let orderByElement = new this.Coach.OrderByElement(sql);
        this.orderBy.unshift(orderByElement);
    }
};

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}
