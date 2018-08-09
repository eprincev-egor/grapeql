"use strict";

const Plan = require("./Plan");

const Select = require("../syntax/Select/Select");

class ValuesPlan extends Plan {
    build() {
        this.buildColumns();
    }

    buildColumns() {
        let valueRow = this.values[0];

        valueRow.items.forEach((valueItem, index) => {
            let column = {
                links: [],
                subPlans: []
            };

            // with x (id, name) as (...)
            // with x (id, name) as (...)
            if ( this.withQuery && this.withQuery.columns ) {
                let withName = this.withQuery.columns[ index ];
                if ( withName ) {
                    column.name = withName.toLowerCase();
                    
                    this.columnByName[ column.name ] = column;
                }
            }

            this.values.forEach(valueRow => {
                let valueItem = valueRow.items[ index ];

                valueItem.walk((child, walker) => {
                    if ( child instanceof Select ) {

                        let subPlan = new Plan.SelectPlan({
                            select: child,
                            server: this.server,
                            parentPlan: this
                        });
                        subPlan.build();

                        column.subPlans.push( subPlan );

                        walker.skip();
                    }
                }); 
            });

            this.columns.push( column );
        });
    }
}

module.exports = ValuesPlan;