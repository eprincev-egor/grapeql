"use strict";

const Plan = require("./Plan");

class ValuesPlan extends Plan {
    build() {
        let valueRow = this.values[0];

        valueRow.items.forEach((valueItem, index) => {
            let column = {links: []};

            // with x (id, name) as (...)
            // with x (id, name) as (...)
            if ( this.withQuery && this.withQuery.columns ) {
                let withName = this.withQuery.columns[ index ];
                if ( withName ) {
                    column.name = withName.toLowerCase();
                    
                    this.columnByName[ column.name ] = column;
                }
            }

            this.columns.push( column );
        });
        
        console.log( this.columns );
    }
}

module.exports = ValuesPlan;