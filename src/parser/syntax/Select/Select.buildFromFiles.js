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
    // params.node
    // params.server
    // params.columns
    // params.offset
    // params.limit
    // params.where
    build(params) {
        let Select = this.Coach.Select;
        let select = new Select();
        let server = params.server;

        this._build(params, select);

        select.removeUnnesaryJoins({ server });

        if ( params.limit != null && params.limit != "all" ) {
            select.setLimit(params.limit);
        }

        if ( params.offset != null && params.offset > 0 ) {
            select.setOffset(params.offset);
        }

        return select;
    },

    _build(params, select) {
        let originalSelect = this;
        let server = params.server;

        this.from.forEach(fromItem => {
            select.addFrom( fromItem.clone() );
        });
        this.joins.forEach(join => {
            select.addJoin( join.clone() );
        });

        params.columns.forEach(key => {
            let definedColumn = originalSelect.getColumnByAlias( key );
            if ( definedColumn ) {
                select.addColumn(`${ definedColumn.expression } as "${ key }"`);
                return;
            }

            let dbColumnKey = key;
            let fromItem;
            if ( /\./.test(key) ) {
                fromItem = select.getFromItemByAlias( key.split(".")[0] );
                dbColumnKey = key.split(".")[1];
            } else {
                fromItem = select.from[0];
            }

            if ( fromItem.file ) {
                let node = getNode(fromItem.file, server);
                let join = fromItem.parent;

                join.from = node.parsed.from[0];

                if ( !fromItem.as ) {
                    let As = this.Coach.As;
                    let as = new As();
                    as.hasWordAs = true;

                    let last = fromItem.file.path.slice(-1)[0];

                    if ( last.content ) {
                        as.fillClone.call( this, as );
                    } else {
                        as.content = last.name;
                    }
                    as.content = as.content.replace(/\.sql$/, "");

                    if ( last.name ) {
                        join.on.replaceLink(
                            last.name.replace(/\.sql$/, ""),
                            as.getAliasSql()
                        );
                    }
                    join.from.as = as;
                }

                fromItem = join.from;
            }

            let fromSql = fromItem.getAliasSql();
            let dbTable = fromItem.getDbTable( server );
            let dbColumn = dbTable.getColumn( dbColumnKey );

            if ( dbColumn ) {
                select.addColumn(`${ fromSql }.${ dbColumn.name } as "${ key }"`);
            }
        });

    }
};
