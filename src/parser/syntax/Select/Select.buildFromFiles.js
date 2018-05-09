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
                if ( keyParts.length == 2 ) {
                    select.addColumn(`${ key } as "${ key }"`);
                } else {
                    select.addColumn(`${ key } as "${ key }"`);
                }
            }
        });

        select.removeUnnesaryJoins({ server });
        select.buildFromFiles({ server });
        select.removeUnnesaryJoins({ server });

        if ( limit != null && limit != "all" ) {
            select.setLimit(limit);
        }

        if ( offset != null && offset > 0 ) {
            select.setOffset(offset);
        }

        return select;
    },

    buildFromFiles({ server }) {
        const As = this.Coach.As;

        for (let i = 0, n = this.joins.length; i < n; i++) {
            let join = this.joins[i];

            if ( !join.from.file ) {
                continue;
            }

            let oldFromItem = join.from;
            let node = getNode(join.from.file, server);
            let nodeFrom = node.parsed.from[0].clone();
            let nodeAliasSql = nodeFrom.getAliasSql();
            join.from = nodeFrom;

            let as = oldFromItem.as;
            if ( !as ) {
                as = oldFromItem.file.toAs();
            }

            join.from.as = as;

            for (let j = 0, m = node.parsed.joins.length; j < m; j++) {
                let anotherJoin = node.parsed.joins[ j ];
                anotherJoin = anotherJoin.clone();

                let alias = anotherJoin.from.getAliasSql();
                let newAlias = `"${ as.getAliasSql() }.${ alias }"`;
                let newAliasWithoutQuotes = `${ as.getAliasSql() }.${ alias }`;

                anotherJoin.from.as = new As(`as ${ newAlias }`);

                anotherJoin.on.replaceLink(alias, newAlias);
                this.replaceLink(newAliasWithoutQuotes, newAlias);

                anotherJoin.on.replaceLink(nodeAliasSql, as.getAliasSql());

                this.addJoinAfter( anotherJoin, join );
            }
        }
    },

    addJoinAfter(join, afterJoin) {
        this.addChild(join);

        let index = this.joins.indexOf( afterJoin );
        this.joins.splice(index + 1, 0, join);

        this._validate();
        return join;
    }
};
