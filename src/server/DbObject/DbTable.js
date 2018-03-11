"use strict";

class DbTable {
    constructor(params) {
        this.name = params.name;
        this.scheme = params.scheme;
        this.columns = {};
        this.constraints = {};
    }
    
    addColumn(column) {
        this.columns[ column.name ] = column;
    }
    
    addConstraint(constraint) {
        this.constraints[ constraint.name ] = constraint;
    }
}

module.exports = DbTable;
