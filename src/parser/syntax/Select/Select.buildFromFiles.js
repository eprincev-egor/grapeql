"use strict";

function getDbTable(server, fromItem) {
    let tableLink = fromItem.table.link;
    let tableName;

    let dbSchema;
    if ( tableLink.length > 1 ) {
        let schemaObjectName = tableLink[0];

        for (let schemaName in server.schemas) {
            if ( schemaObjectName.equalString( schemaName ) ) {
                dbSchema = server.schemas[ schemaName ];
                break;
            }
        }

        tableName = tableLink[1];
    } else {
        dbSchema = server.getSchema("public");
        tableName = tableLink[0];
    }

    tableName = tableName.word || tableName.content;
    return dbSchema.getTable( tableName );
}

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

        let fromItem = select.from[0];
        let dbTable = getDbTable( server, fromItem );

        let fromSql;
        if ( fromItem.as ) {
            // public.company as company
            fromSql = fromItem.as.toAliasSql();
        } else {
            // public.company
            fromSql = fromItem.toString();
        }

        params.columns.forEach(key => {
            let dbColumn = dbTable.getColumn( key );

            if ( dbColumn ) {
                select.addColumn(`${ fromSql }.${ dbColumn.name } as "${ key }"`);
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
