"use strict";

class DbFunction {
    constructor(params) {
        this.name = params.name;
        this.scheme = params.scheme;
        this.returnType = params.returnType;
    }
}

module.exports = DbFunction;
