"use strict";

const Deps = require("../../parser/deps/Deps");

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
        let deps = new Deps({
            server: this.server,
            select: this.syntax.select
        });

        // validate reverse query
        deps.tables.forEach(table => {
            let reverseQuery = this.syntax.select.reverse.find(reverseQuery => {
                let schemaName = "public",
                    tableName = reverseQuery.table.first().toLowerCase();
                
                if ( reverseQuery.table.link.length > 1 ) {
                    schemaName = tableName;
                    tableName = reverseQuery.table.getLast().toLowerCase();
                }

                return (
                    table.schema == schemaName &&
                    table.table == tableName
                );
            });

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
            schema: "sql_cache",
            name: this.syntax.name,
            columns: []
        };

        this.syntax.select.columns.map(syntaxColumn => {
            let name = syntaxColumn.as.toLowerCase();
            let type = syntaxColumn.expression.getType({
                server: this.server
            });

            table.columns.push({name, type});
        });

        await this.server.database.createTable(table);
    }

    async createTriggers() {
        this.deps.tables.forEach(table => {
            let path = table.schema + "." + table.name;
            let events = {};
            
            events[ "delete:" + path ] = "onEvent";
            events[ "update:" + path ] = "onEvent";
            events[ "insert:" + path ] = "onEvent";
            
            class CacheTrigger {
                getEvents() {
                    return events;
                }

                onEvent({type, row, prev, changes}) {

                }
            }

            this.server.triggers.create(CacheTrigger);
        });
    }
}

module.exports = Cache;