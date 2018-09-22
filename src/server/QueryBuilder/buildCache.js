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
                let cacheTableAs = dbTable.schema + "." + dbTable.name;


                // add join cache table
                let on = [];
                let primaryKey = dbTable.getPrimaryKey();
                primaryKey.columns.forEach(key => {
                    on.push(`
                        ${ cacheTableAs }.${ key } = ${ fromItemAs }.${ key }
                    `);
                });
                on = on.join(" and ");

                let join = new Join(`left join ${ cacheTableAs } on ${ on }`);
                fromItem.unshiftJoin( join );


                // replace column links
                let cacheColumns = dbTable.columnsArr.filter(dbColumn =>
                    !primaryKey.columns.includes(dbColumn.name)
                );
                cacheColumns = cacheColumns.map(dbColumn => dbColumn.name);

                from.links.forEach(link => {
                    if ( !cacheColumns.includes(link.name) ) {
                        return;
                    }

                    // select *
                    if ( !link.syntax ) {
                        return;
                    }

                    let objectLink = link.syntax;
                    let expression = objectLink.findParentInstance( Expression );

                    expression.replaceElement( objectLink, cacheTableAs + "." + link.name );
                });
            });
        });
    });
}

module.exports = buildCache;