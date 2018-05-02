"use strict";

module.exports = {
    // params.node
    // params.server
    // params.columns
    // params.offset
    // params.limit
    // params.where
    build(params) {
        let originalSelect = this;
        let select = this.clone();
        let server = params.server;

        select.clearColumns();



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

            let fromSql = fromItem.getAliasSql();
            let dbTable = fromItem.getDbTable( server );
            let dbColumn = dbTable.getColumn( dbColumnKey );

            if ( dbColumn ) {
                select.addColumn(`${ fromSql }.${ dbColumn.name } as "${ key }"`);
            }
        });

        select.removeUnnesaryJoins({ server });

        if ( params.limit != null && params.limit != "all" ) {
            select.setLimit(params.limit);
        }

        if ( params.offset != null && params.offset > 0 ) {
            select.setOffset(params.offset);
        }

        return select;
    }
};
