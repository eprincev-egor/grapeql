"use strict";

const Filter = require("../../../filter/Filter");

module.exports = {
    buildSelect({
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
        where = new Filter(where);

        let columns = where.getColumns();
        let sqlModel = this.buildSqlModelByColumns({
            node,
            server,
            columns,
            originalSelect
        });

        let whereSql = where.toSql( sqlModel );
        this.addWhere( whereSql );
    },

    buildSqlModelByColumns({
        node,
        server,
        columns,
        originalSelect
    }) {
        let sqlModel = {};
        columns.forEach(key => {
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

        return sqlModel;
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
        this.addChild(orderByElement);
    },

    setLimit(limit) {
        if ( limit < 0 ) {
            throw new Error("limit must be 'all' or positive number: " + limit);
        }
        this.limit = limit;
    },

    setOffset(offset) {
        if ( offset < 0 ) {
            throw new Error("offset must by positive number: " + offset);
        }

        this.offset = offset;
    }
};
