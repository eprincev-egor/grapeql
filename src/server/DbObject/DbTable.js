"use strict";

class DbTable {
    constructor({name, schema}) {
        this.name = name;
        this.schema = schema;
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

    getPrimaryKey() {
        for (let key in this.constraints ) {
            let constraint = this.constraints[ key ];

            if ( constraint.type == "primary key" ) {
                return constraint;
            }
        }
    }

    getLowerPath() {
        return (
            (this.schema || "public").toLowerCase() + "." + 
            this.name.toLowerCase()
        );
    }
}

module.exports = DbTable;
