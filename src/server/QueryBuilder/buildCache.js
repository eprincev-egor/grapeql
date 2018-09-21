"use strict";

const Deps = require("../../parser/deps/Deps");
const Join = require("../../parser/syntax/Join");
const Select = require("../../parser/syntax/Select/Select");

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
        if ( !table.cacheFromItems.length ) {
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

        table.cacheFromItems.forEach(fromItem => {
            cacheTables.forEach(dbTable => {
                let fromItemAs = fromItem.getAliasSql();
                let cacheTableAs = dbTable.schema + "." + dbTable.name;

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

                let select = fromItem.findParentInstance(Select);
                if ( select ) {
                    table.cacheColumns.forEach(key => {
                        select.replaceLink(
                            fromItemAs + "." + key,
                            cacheTableAs + "." + key
                        );
                    });
                }
            });
        });
    });
}

module.exports = buildCache;