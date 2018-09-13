"use strict";

const Cache = require("./Cache");

class CacheManager {
    constructor({server}) {
        this.server = server;
        this._cache = {};
    }

    async create(cacheForSyntax) {
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