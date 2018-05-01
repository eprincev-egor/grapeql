"use strict";

module.exports = {
    // params.node
    // params.server
    // params.columns
    // params.offset
    // params.limit
    // params.where
    build(params) {
        let select = this.clone();
        let server = params.server;

        select.clearColumns();

        let tableName = select.from[0].table.link[0].word;
        let dbSchema = server.getSchema("public");
        let dbTable = dbSchema.getTable( tableName );

        params.columns.forEach(key => {
            let dbColumn = dbTable.getColumn( key );

            if ( dbColumn ) {
                select.addColumn(`${ tableName }.${ dbColumn.name } as "${ key }"`);
            }
        });

        if ( params.limit != null && params.limit != "all" ) {
            select.setLimit(params.limit);
        }

        if ( params.offset != null && params.offset > 0 ) {
            select.setOffset(params.offset);
        }

        return select;
    }
};
