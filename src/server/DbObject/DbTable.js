"use strict";

class DbTable {
    constructor(params) {
        this.name = params.name;
        this.schema = params.schema;
        this.columns = {};
        this.columnsArr = [];
        this.constraints = {};
    }

    getColumn(name) {
        if ( name in this.columns ) {
            return this.columns[ name ];
        }
        for (let key in this.columns) {
            if ( key.toLowerCase() == name.toLowerCase() ) {
                return this.columns[ key ];
            }
        }
    }

    addColumn(column) {
        this.columns[ column.name ] = column;
        this.columnsArr.push( column );
    }

    addConstraint(constraint) {
        this.constraints[ constraint.name ] = constraint;
    }

    getLowerPath() {
        return (
            (this.schema || "public").toLowerCase() + "." + 
            this.name.toLowerCase()
        );
    }
}

module.exports = DbTable;
