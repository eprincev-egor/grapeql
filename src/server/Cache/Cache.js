"use strict";

const Deps = require("../../parser/deps/Deps");
const {buildUpdateCache, buildInsertCache} = require("../QueryBuilder/buildUpdateCache");
const GrapeQLCoach = require("../../parser/GrapeQLCoach");

class Cache {
    constructor({
        cacheForSyntax,
        server
    }) {
        this.syntax = cacheForSyntax;
        this.server = server;

        this.findForDbTable();
        this.parseDeps();

        this.columns = [];
        this.validateCacheSyntax();
    }

    findForDbTable() {
        
        let schemaName = this.syntax.table.first();
        let tableName = this.syntax.table.last();
        if ( this.syntax.table.link.length == 1 ) {
            tableName = schemaName;
            schemaName = "public";
        }
        tableName = tableName.toLowerCase();
        schemaName = schemaName.toLowerCase();

        let dbSchema = this.server.database.getSchema( schemaName );
        let dbTable = dbSchema && dbSchema.getTable( tableName );

        if ( !dbTable ) {
            throw new Error(`table ${ tableName } not found`);
        }

        let primaryKey = dbTable.getPrimaryKey();

        if ( !primaryKey ) {
            throw new Error(`table ${ tableName } should have primary key`);
        }

        this.forDbTable = dbTable;
        this.forPrimaryKey = primaryKey;
    }

    validateCacheSyntax() {
        if ( !this.syntax.select.columns.length ) {
            throw new Error("cache should have columns");
        }

        this.syntax.select.columns.forEach(column => {
            if ( column.isStar() ) {
                throw new Error("star link is not allowed here: " + column.toString());
            }

            if ( !column.as ) {
                throw new Error("column should have alias: " + column.toString());
            }

            let alias = column.as.toLowerCase();
            if ( this.columns.includes(alias) ) {
                throw new Error("column alias should be unique: " + column.toString());
            }

            this.columns.push( alias );
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
        await this.createCacheColumns();
        await this.createTriggers();
    }

    async createCacheColumns() {
        let cacheColumns = [];
        this.syntax.select.columns.map(syntaxColumn => {
            let name = syntaxColumn.as.toLowerCase();
            let type = syntaxColumn.expression.getType({
                server: this.server
            });

            cacheColumns.push({name, type});
        });

        await this.server.database.createColumns(
            this.forDbTable, 
            cacheColumns
        );
    }

    async createTriggers() {
        let cache = this;

        let events = {
            begin: "onBegin",
            beforeCommit: "onBeforeCommit"
        };
        events[ "insert:" + this.forDbTable.getLowerPath() ] = "onInsertForTable";

        let map = new WeakMap();

        class CacheTrigger {
            getEvents() {
                return events;
            }
        
            onBegin({ transaction }) {
                map.set(transaction, []);
            }

            async onInsertForTable({db, row}) {
                await cache.onInsertForTable({db, row});
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

            if ( path == this.forDbTable.getLowerPath() ) {
                return;
            }
            
            events[ "delete:" + path ] = "onEvent";
            events[ "update:" + path ] = "onEvent";
            events[ "insert:" + path ] = "onEvent";
        });

        this.server.triggers.create(CacheTrigger);
    }

    async onInsertForTable({db, row}) {
        let sql = buildInsertCache({
            row,
            cache: this
        });
        
        if ( !sql ) {
            return;
        }

        await db.query(sql);
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