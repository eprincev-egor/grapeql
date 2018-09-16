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
}

module.exports = CacheManager;