"use strict";

const Filter = require("../../../filter/Filter");
const {value2sql} = require("../../../helpers");

module.exports = {
    buildSelect({
        node,
        server,
        columns,
        where,
        orderBy,
        offset,
        limit,
        vars
    }) {
        let select = this.select.clone();

        this.buildVars({
            select,
            vars
        });

        this.buildColumns({
            select,
            columns,
            originalSelect: this.select
        });

        if ( where ) {
            this.buildWhere({
                select,
                where,
                originalSelect: this.select,
                node,
                server
            });
        }

        if ( orderBy ) {
            this.buildOrderBy({
                select,
                orderBy,
                originalSelect: this.select
            });
        }

        this.buildFromFiles({ server, select });

        if ( limit != null && limit != "all" ) {
            select.setLimit(limit);
        }

        if ( offset != null && offset > 0 ) {
            select.setOffset(offset);
        }

        return select;
    },

    buildVars({ select, vars }) {
        vars = vars || {};
        
        select.walk(variable => {
            if ( !(variable instanceof this.Coach.SystemVariable) ) {
                return;
            }

            let key = variable.toLowerCase();
            let definition = this.declare.variables[ key ];
            let value = vars[ "$" + key ];

            if ( value == null && definition.notNull ) {
                throw new Error(`expected not null value for variable: ${key}`);
            }

            let type = definition.getType();
            let sqlValue = value2sql(type, value);
            let expression = new this.Coach.Expression("" + sqlValue);
            let element = expression.elements[0];

            variable.parent.replaceElement(variable, element);
        });
    },

    buildColumns({select, originalSelect, columns}) {
        select.clearColumns();

        columns.forEach(key => {
            let keyParts = key.split(".");

            let definedColumn = originalSelect.getColumnByAlias( key );
            if ( definedColumn ) {
                if ( definedColumn.expression.isLink() ) {
                    let link = definedColumn.expression.getLink();
                    let last = link.getLast();

                    if ( last.strictEqualString(key) ) {
                        select.addColumn(`${ definedColumn.expression }`);
                        return;
                    }
                }

                select.addColumn(`${ definedColumn.expression } as "${ key }"`);
                return;
            }

            let columnKey = key;
            let fromItem;
            if ( keyParts.length > 1 ) {
                fromItem = select.getFromItemByAlias( keyParts[0] );
                columnKey = keyParts.slice(-1)[0];
            } else {
                fromItem = select.from[0];
            }

            if ( columnKey == key ) {
                let fromSql = fromItem.getAliasSql();
                select.addColumn(`${ fromSql }.${ columnKey }`);
            } else {
                select.addColumn(`${ key } as "${ key }"`);
            }
        });
    },

    buildColumnExpression({originalSelect, key}) {
        let keyParts = key.split(".");

        let definedColumn = originalSelect.getColumnByAlias( key );
        if ( definedColumn ) {
            return definedColumn.expression.toString();
        }

        let columnKey = key;
        let fromItem;
        if ( keyParts.length > 1 ) {
            fromItem = originalSelect.getFromItemByAlias( keyParts[0] );
            columnKey = keyParts.slice(-1)[0];
        } else {
            fromItem = originalSelect.from[0];
        }

        if ( columnKey == key ) {
            let fromSql = fromItem.getAliasSql();
            return `${ fromSql }.${ columnKey }`;
        } else {
            return key;
        }
    },

    buildWhere({
        select,
        where, originalSelect,
        node, server
    }) {
        where = new Filter(where);

        let columns = where.getColumns();
        let sqlModel = this.buildSqlModelByColumns({
            node,
            server,
            columns,
            originalSelect
        });

        let whereSql = where.toSql( sqlModel );
        select.addWhere( whereSql );
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

            let expression = this.buildColumnExpression({
                key,
                originalSelect
            });
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

    buildOrderBy({
        select, orderBy,
        originalSelect
    }) {
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

            let expression = this.buildColumnExpression({originalSelect, key});
            select.unshiftOrderByElement(`${ expression } ${ vector }`);
        }
    }
};
