"use strict";

class DbFunction {
    constructor(params) {
        this.name = params.name;
        this.schema = params.schema;
        this.returnType = params.returnType;
    }
}

module.exports = DbFunction;
