"use strict";

function getNode(file, server) {
    for (let key in server.nodes) {
        let node = server.nodes[ key ];
        let leftFile = node.options.file.replace(/\.sql$/, "");
        let rightFile = file.toString().replace(/\.sql$/, "");

        if ( leftFile == rightFile ) {
            return node;
        }
    }
}

module.exports = {
    build({
        //node,
        server,
        columns,
        offset,
        limit
        //, where
    }) {
        let originalSelect = this;
        let select = originalSelect.clone();

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
    }
};

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}
