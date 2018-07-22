"use strict";

const buildUpdateOldValues = require("./buildUpdateOldValues");
const _ = require("lodash");

function buildChangesCatcher({
    query, 
    queryBuilder
}) {
    if ( !query.returning && !query.returningAll ) {
        query.returningAll = true;
    }
    
    let type = queryBuilder.getQueryCommandType(query);

    if ( type == "update" ) {
        buildUpdateOldValues({
            update: query, 
            queryBuilder
        });
    }

    return {
        prepareResult: prepareResult.bind(null, {
            query,
            type,
            queryBuilder
        })
    };
}

function prepareResult({
    query,
    type,
    queryBuilder
}, result) {
    // next syntax must return an object:
    // select row
    // insert row
    // update row
    // delete row
    if ( query.returningObject ) {
        if ( !result.rows || !result.rows.length ) {
            result = null;
        }

        else if ( result.rows.length === 1 ) {
            result = result.rows[0];
        }
    } else {
        result = result.rows || [];
    }
    

    
    if ( 
        !result ||
        type != "insert" &&
        type != "update" &&
        type != "delete"
    ) {
        return {
            result,
            changesStack: []
        };
    }

    // public.orders
    let table = queryBuilder.getQueryTableName(query);

    let rows = _.isArray(result) ? result : [result];
    let changesStack = [];

    for (let i = 0, n = rows.length; i < n; i++) {
        let row = rows[i];

        if ( type == "update" ) {
            let prev = {},
                changes = {},
                newRow = {};
            
            for (let key in row) {
                if ( /old_/.test(key) ) {
                    continue;
                }
                
                let value = row[ key ];
                prev[ key ] = value;
                newRow[ key ] = value;

                let oldKey = "old_" + key;
                if ( oldKey in row ) {
                    let oldValue = row[ oldKey ];
                    
                    if ( oldValue != value ) {
                        changes[ key ] = value;
                        prev[ key ] = oldValue;
                    }
                }
            }

            changesStack.push({
                type,
                table,
                row: newRow,
                changes,
                prev
            });
        } else {
            changesStack.push({
                type,
                table,
                row
            });
        }
    }

    return {
        result,
        changesStack
    };
}

module.exports = buildChangesCatcher;