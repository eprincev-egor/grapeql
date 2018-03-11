"use strict";

class DbConstraint {
    constructor(params) {
        this.name = params.name;
        this.type = params.type;
        this.columns = params.columns;
    }
}

module.exports = DbConstraint;
