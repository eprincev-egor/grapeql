"use strict";

const Cache = require("./Cache");
const _ = require("lodash");
const GrapeQLCoach = require("../../parser/GrapeQLCoach");

class CacheManager {
    constructor({server}) {
        this.server = server;
        this._cache = [];
    }

    async create(cacheForSyntax) {
        if ( _.isString(cacheForSyntax) ) {
            let coach = new GrapeQLCoach(cacheForSyntax);
            coach.replaceComments();
            coach.skipSpace();

            cacheForSyntax = coach.parseCacheFor();
        }

        let cache = new Cache({
            server: this.server,
            cacheForSyntax
        });
        await cache.build();

        this._cache.push(cache);
    }

    getCacheColumns({schema, name}) {
        let cachesForTable = this._cache.filter(cache =>
            cache.forDbTable.schema == schema &&
            cache.forDbTable.name == name
        );
        
        if ( !cachesForTable.length ) {
            return null;
        }

        let columns = [];
        cachesForTable.forEach(cache => {
            columns = columns.concat( cache.columns );
        });

        return columns;
    }

    getCacheDbTable({schema, table, column}) {
        let cache = this._cache.find(cache =>
            cache.forDbTable.schema == schema &&
            cache.forDbTable.name == table &&
            column in cache.dbTable.columns
        );

        if ( !cache ) {
            return null;
        }

        return cache.dbTable;
    }
}

module.exports = CacheManager;