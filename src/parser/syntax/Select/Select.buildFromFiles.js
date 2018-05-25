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
        let joins = this._getJoinFiles();
        if ( !joins.length ) {
            return;
        }
        
        joins.forEach(join => {
            this._buildFromFile({ 
                server, 
                fromItem: join.from 
            });
        });
        this.removeUnnesaryJoins({ server });
        
        this.buildFromFiles({ server });
    },
    
    _buildFromFile({ server, fromItem }) {
        const As = this.Coach.As;
        
        let join = fromItem.parent;
        
        let node = getNode(fromItem.file, server);
        let nodeFrom = node.parsed.from[0].clone();
        let nodeAliasSql = nodeFrom.getAliasSql();
        join.from = nodeFrom;

        let as = fromItem.as;
        if ( !as ) {
            as = fromItem.file.toAs();
        }
        nodeFrom.as = as;

        let nodeJoins = node.parsed.from[0].joins;
        for (let j = 0, m = nodeJoins.length; j < m; j++) {
            let anotherJoin = nodeJoins[ j ];
            anotherJoin = anotherJoin.clone();

            let alias = anotherJoin.from.getAliasSql();
            let newAliasWithoutQuotes = `${ trimQuotes( as.getAliasSql() ) }.${ trimQuotes( alias ) }`;
            let newAlias = `"${ newAliasWithoutQuotes }"`;

            anotherJoin.from.as = new As(`as ${ newAlias }`);

            anotherJoin.on.replaceLink(alias, newAlias);
            this.replaceLink(newAliasWithoutQuotes, newAlias);

            anotherJoin.on.replaceLink(nodeAliasSql, as.getAliasSql());

            this.addJoinAfter( anotherJoin, join );
        }
    },

    _getJoinFiles() {
        let joins = [];
        
        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[ i ];

            fromItem.eachJoin(join => {
                if ( !join.from.file ) {
                    return;
                }
                
                joins.push( join );
            });
        }
        
        return joins;
    },

    addJoinAfter(join, afterJoin) {
        afterJoin.parent.addJoinAfter(join, afterJoin);
        this._validate();
    }
};

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}
