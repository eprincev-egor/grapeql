"use strict";

class DbColumn {
    constructor(params) {
        this.name = params.name;
        this.default = params.default;
        this.type = params.type;
        this.nulls = params.nulls;
        // for tests
        this.table = params.table;
        this.scheme = params.scheme;
    }
}

module.exports = DbColumn;
