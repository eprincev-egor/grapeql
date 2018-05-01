"use strict";

class DbSchema {
    constructor(params) {
        this.name = params.name;
        this.tables = {};
        this.functions = {};
    }

    getTable(name) {
        if ( name in this.tables ) {
            return this.tables[ name ];
        }
        for (let key in this.tables) {
            if ( key.toLowerCase() == name.toLowerCase() ) {
                return this.tables[ key ];
            }
        }
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

module.exports = DbSchema;
