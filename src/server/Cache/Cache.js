"use strict";

const Deps = require("../../parser/deps/Deps");
const buildUpdateCache = require("../QueryBuilder/buildUpdateCache");
const GrapeQLCoach = require("../../parser/GrapeQLCoach");

class Cache {
    constructor({
        cacheForSyntax,
        server
    }) {
        this.syntax = cacheForSyntax;
        this.server = server;

        this.parseDeps();
        this.validateCacheSyntax();
    }

    validateCacheSyntax() {
        if ( !this.syntax.select.columns.length ) {
            throw new Error("cache should have columns");
        }

        let aliasMap = {};
        this.syntax.select.columns.forEach(column => {
            if ( column.isStar() ) {
                throw new Error("star link is not allowed here: " + column.toString());
            }

            if ( !column.as ) {
                throw new Error("column should have alias: " + column.toString());
            }

            let alias = column.as.toLowerCase();
            if ( alias in aliasMap ) {
                throw new Error("column alias should be unique: " + column.toString());
            }

            aliasMap[ alias ] = true;
        });
    }

    parseDeps() {
        let depsSelect = `
            select * 
            from ${ this.syntax.table }
            left join lateral (${ this.syntax.select.toString() }) as tmp on true
        `.trim();
        depsSelect = GrapeQLCoach.parseSelect(depsSelect);

        let deps = new Deps({
            server: this.server,
            select: depsSelect
        });

        // validate reverse query
        deps.tables.forEach(table => {
            let tablePath = `${ table.schema }.${ table.name }`;

            // reverseQuery for main table not needed
            if ( tablePath == this.syntax.table.getDbTableLowerPath() ) {
                return;
            }

            let reverseQuery = this.syntax.reverse.find(reverseQuery => 
                reverseQuery.table.getDbTableLowerPath() == tablePath
            );

            if ( !reverseQuery ) {
                throw new Error(`reverse query for table ${ table.schema }.${ table.name } does not exists`);
            }
        });

        this.deps = deps;
    }

    async build() {
        await this.createCacheTable();
        await this.createTriggers();
    }

    async createCacheTable() {
        let table = {
            schema: "gql_cache",
            name: this.syntax.name,
            columns: [],
            constraints: {}
        };

        this.syntax.select.columns.map(syntaxColumn => {
            let name = syntaxColumn.as.toLowerCase();
            let type = syntaxColumn.expression.getType({
                server: this.server
            });

            table.columns.push({name, type});
        });

        this.dbTable = await this.server.database.createTable(table);
    }

    async createTriggers() {
        let cache = this;

        let events = {
            begin: "onBegin",
            beforeCommit: "onBeforeCommit"
        };

        let map = new WeakMap();

        class CacheTrigger {
            getEvents() {
                return events;
            }
        
            onBegin({ transaction }) {
                map.set(transaction, []);
            }
        
            onEvent({
                transaction, type, table,
                row, prev, changes
            }) {
                let changesArr = map.get(transaction);

                if ( type == "update" ) {
                    changesArr.push({
                        table, type,
                        row, prev, changes
                    });
                } else {
                    changesArr.push({
                        table, type,
                        row
                    });
                }
            }
        
            async onBeforeCommit({ db, transaction }) {
                // find in map changes for it transaction
                let changesArr = map.get(transaction);
                // clear memory
                map.delete(transaction);

                // build sql and run him
                await cache.updateCache({db, changesArr});
            }
        }

        this.deps.tables.forEach(table => {
            let path = table.schema + "." + table.name;
            
            events[ "delete:" + path ] = "onEvent";
            events[ "update:" + path ] = "onEvent";
            events[ "insert:" + path ] = "onEvent";
        });

        this.server.triggers.create(CacheTrigger);
    }

    async updateCache({db, changesArr}) {
        let sql = buildUpdateCache({
            changesArr, 
            cache: this
        });

        if ( !sql ) {
            return;
        }

        await db.query(sql);
    }
}

module.exports = Cache;