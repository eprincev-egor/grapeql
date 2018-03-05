"use strict";

class DbTable {
    constructor(params) {
        this.name = params.name;
        this.scheme = params.scheme;
        this.columns = {};
    }
}

module.exports = DbTable;
