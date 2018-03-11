"use strict";

class DbScheme {
    constructor(params) {
        this.name = params.name;
        this.tables = {};
        this.functions = {};
    }
    
    getTable(name) {
        return this.tables[ name ];
    }
    
    addTable(table) {
        this.tables[ table.name ] = table;
    }
    
    addFunction(dbFunction) {
        let name = dbFunction.name;
        this.functions[ name ] = dbFunction;
    }
    
    getFunction(name/*, args */) {
        return this.functions[ name ];
    }
}

module.exports = DbScheme;
