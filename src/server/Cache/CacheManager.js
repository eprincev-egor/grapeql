"use strict";

const Cache = require("./Cache");
const _ = require("lodash");
const GrapeQLCoach = require("../../parser/GrapeQLCoach");

class CacheManager {
    constructor({server}) {
        this.server = server;
        this._cache = {};
    }

    async create(cacheForSyntax) {
        if ( _.isString(cacheForSyntax) ) {
            let coach = new GrapeQLCoach(cacheForSyntax);
            coach.replaceComments();
            coach.skipSpace();

            cacheForSyntax = coach.parseCacheFor();
        }

        let name = cacheForSyntax.name.toLowerCase();
        if ( name in this._cache ) {
            throw new Error(`cache ${name} already exists`);
        }

        let cache = new Cache({
            server: this.server,
            cacheForSyntax
        });
        await cache.build();

        this._cache[ name ] = cache;
    }
}

module.exports = CacheManager;