"use strict";

const Deps = require("../../parser/deps/Deps");
const Join = require("../../parser/syntax/Join");
const Expression = require("../../parser/syntax/Expression");

function buildCache({
    select,
    queryBuilder
}) {
    let server = queryBuilder.server;
    let deps = new Deps({
        select,
        server
    });

    deps.tables.forEach(table => {
        if ( !table.cacheFrom.length ) {
            return;
        }

        let cacheTables = [];
        table.cacheColumns.forEach(key => {
            let dbTable = server.cache.getCacheDbTable({
                schema: table.schema,
                table: table.name,
                column: key
            });

            if ( !cacheTables.includes(dbTable) ) {
                cacheTables.push(dbTable);
            }
        });

        table.cacheFrom.forEach(from => {
            let fromItem = from.syntax;

            cacheTables.forEach(dbTable => {
                let fromItemAs = fromItem.getAliasSql();
                let cacheTableName = dbTable.schema + "." + dbTable.name;
                let cacheTableAs = dbTable.schema + "_" + dbTable.name;


                // add join cache table
                let on = [];
                let primaryKey = dbTable.getPrimaryKey();
                primaryKey.columns.forEach(key => {
                    on.push(`
                        ${ cacheTableAs }.${ key } = ${ fromItemAs }.${ key }
                    `);
                });
                on = on.join(" and ");

                let join = new Join(`left join ${ cacheTableName } as ${ cacheTableAs } on ${ on }`);
                fromItem.unshiftJoin( join );


                // replace column links
                let cacheColumns = dbTable.columnsArr.filter(dbColumn =>
                    !primaryKey.columns.includes(dbColumn.name)
                );
                cacheColumns = cacheColumns.map(dbColumn => dbColumn.name);

                from.links.forEach(link => {
                    // select *
                    if ( !link.syntax ) {
                        return;
                    }

                    let objectLink = link.syntax;
                    let expression = objectLink.findParentInstance( Expression );

                    if ( cacheColumns.includes(link.name) ) {
                        expression.replaceElement( objectLink, cacheTableAs + "." + link.name );
                    } 

                    // select from company where id > 100
                    //
                    // for fix error: column reference "id" is ambiguous
                    // need replace single column link
                    else if ( 
                        objectLink.link.length == 1 &&
                        primaryKey.columns.includes( objectLink.last().toLowerCase() )
                    ) {
                        // objectLink.toString() for save string case
                        expression.replaceElement( objectLink, fromItemAs + "." + objectLink.toString() );
                    }
                });
            });
        });
    });
}

module.exports = buildCache;