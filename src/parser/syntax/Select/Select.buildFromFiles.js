"use strict";

const {getNode} = require("./helpers");
const Filter = require("../../../filter/Filter");

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

        select.buildFromFiles({ server });

        if ( limit != null && limit != "all" ) {
            select.setLimit(limit);
        }

        if ( offset != null && offset > 0 ) {
            select.setOffset(offset);
        }

        return select;
    },

    buildCount({
        node,
        server,
        where
    }) {
        let select = this.clone();

        select.clearColumns();
        select.addColumn("count(*) as count");

        if ( select.orderBy ) {
            select.orderBy.forEach(elem => {
                select.removeChild(elem);
            });
            delete select.orderBy;
        }


        if ( where ) {
            select.buildWhere({
                where,
                originalSelect: this,
                node,
                server
            });
        }

        select.buildFromFiles({ server });

        return select;
    },

    buildIndexOf({
        node,
        server,
        orderBy,
        row,
        where
    }) {
        let select = this.clone();

        select.clearColumns();

        if ( !row ) {
            throw new Error("row must be are filter");
        }
        row = new Filter(row);
        let rowColumns = row.getColumns();

        select.buildColumns({
            columns: rowColumns,
            originalSelect: this
        });

        select.addColumn("row_number() over() as grapeql_row_index");

        if ( orderBy ) {
            select.buildOrderBy({
                orderBy,
                originalSelect: this
            });
        }

        if ( where ) {
            select.buildWhere({
                where,
                originalSelect: this,
                node,
                server
            });
        }

        select.buildFromFiles({ server });

        let sqlModel = this.buildSqlModelByColumns({
            node,
            server,
            columns: rowColumns,
            originalSelect: this
        });
        for (let key in sqlModel) {
            let elem = sqlModel[key];
            elem.sql = `query."${ key }"`;
        }
        let rowFilterSql = row.toSql(sqlModel);

        return new this.Coach.Select(`
            select
                query.grapeql_row_index as index
            from (${select}) as query
            where ${ rowFilterSql }
        `.trim());
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

    buildFromFiles({ server }) {
        checkCircularDeps({select: this, server});
        this._buildFromFiles({ server });
    },
    
    _buildFromFiles({ server }) {
        this.removeUnnesaryJoins({ server });
        this.removeUnnesaryWiths({ server });

        let fileItems = [];
        this.walk(child => {
            if (
                child instanceof this.Coach.FromItem &&
                child.file
            ) {
                fileItems.push( child );
            }
        });
        if ( !fileItems.length ) {
            return;
        }

        fileItems.forEach(fileItem => {
            let select = fileItem.findParentInstance(this.Coach.Select);
            select._buildFromFile({
                server,
                fromItem: fileItem
            });
        });

        this._buildFromFiles({ server });
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
        let nodeSelect = node.parsed;
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

        nodeSelect.columns.forEach(column => {
            if ( !column.as ) {
                return;
            }

            let link = new this.Coach.ObjectLink(`${ newNodeAlias.toString() }.${ trimQuotes( column.as.toString() ) }`);
            let expression = column.expression.clone();
            expression.replaceLink(oldNodeAlias, newNodeAlias);

            this.walk(child => {
                if ( !(child instanceof this.Coach.ColumnLink) ) {
                    return;
                }

                if ( child.equalLink(link) ) {
                    child.parent.replaceElement(child, expression.clone());
                }
            });
        });

        if ( nodeSelect.with ) {
            if ( !this.with ) {
                this.with = [];
            }
            nodeSelect.with.forEach(withQuery => {
                withQuery = withQuery.clone();
                let oldName = withQuery.name;
                let newName = `"${ trimQuotes( newNodeAlias.toString() ) }.${ trimQuotes( oldName.toString() ) }"`;
                newName = new ObjectName(newName);
                withQuery.name = newName;

                this.with.push(withQuery);

                if ( nodeSelect.withRecursive ) {
                    this.withRecursive = true;
                }

                this.eachFromItem(fromItem => {
                    if ( !fromItem.table ) {
                        return;
                    }

                    if ( fromItem.table.link.length != 1 ) {
                        return;
                    }

                    if ( fromItem.table.first().equal(oldName) ) {
                        fromItem.table.clear();
                        fromItem.table.unshift( newName.clone() );
                    }
                });
            });
        }
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

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}

function checkCircularDeps({
    select,
    server,
    map
}) {
    if ( !map ) {
        map = [];
    }
    map.push(select);
    
    select.walk(child => {
        if ( !(child instanceof select.Coach.Join) ) {
            return;
        }
        
        let join = child;
        if ( !join.from.file ) {
            return;
        }
        
        if ( join.isRemovable({server}) ) {
            return;
        }
        
        let node = getNode(join.from.file, server);
        let nodeSelect = node.parsed;
        
        if ( map.includes(nodeSelect) ) {
            throw new Error("circular dependency");
        }
        
        checkCircularDeps({
            server, map,
            select: nodeSelect
        });
    });
}
