"use strict";

class ChangesCatcher {
    constructor(queryBuilder) {
        this.queryBuilder = queryBuilder;
    }

    build(query) {
        this.query = query;

        // insert/update/delete
        if ( query.commandType ) {
            if ( !query.returning ) {
                query.addReturning("*");
            }
        }
        

        let sql = query.toString({ pg: true });

        // after every command we deleted logs
        // and every command work in transaction.
        // parallel transactions can't see neighbor changes
        sql += `
            ;
            delete from gql_system.log_changes
            returning tg_op, table_name, data
            `;

        return sql;
    }

    prepareResult(pgResult) {
        let result = pgResult[0];
        let changesResult = pgResult[1];

        let changesStack = [];
        changesResult.rows.forEach(row => {
            let type;
            let table = row.table_name.toLowerCase();
            
            if ( row.tg_op == 1 ) {
                type = "insert";

                changesStack.push({
                    type,
                    table,
                    row: row.data
                });
            }
            else if ( row.tg_op == 2 ) {
                type = "update";

                let prev = row.data.old,
                    newRow = row.data.new,
                    changes = {};
                
                for (let key in newRow) {
                    let newValue = newRow[ key ];
                    let oldValue = prev[ key ];

                    if ( newValue != oldValue ) {
                        changes[ key ] = newValue;
                    }
                }

                changesStack.push({
                    type,
                    table,

                    prev,
                    row: newRow,
                    changes
                });
            }
            else if ( row.tg_op == 3 ) {
                type = "delete";

                changesStack.push({
                    type,
                    table,
                    row: row.data
                });
            }
        });
        

        return {
            result,
            changesStack
        };
    }
}

module.exports = ChangesCatcher;