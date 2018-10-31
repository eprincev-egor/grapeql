"use strict";

function customReturning(query, pgResult) {
    let result;
    
    // next syntax must return an object:
    // select row
    // insert ... returning row
    // update ... returning row
    // delete ... returning row
    if ( query.returningObject ) {
        if ( !pgResult.rows || !pgResult.rows.length ) {
            result = null;
        }

        else if ( pgResult.rows.length === 1 ) {
            result = pgResult.rows[0];
        }

        else {
            let commandType = query.commandType || "select";
            throw new Error(`${commandType} row should return only one row`);
        }
    } 
    // next syntax must return an value:
    // select value
    // insert ... returning value
    // update ... returning value
    // delete ... returning value
    else if ( query.returningValue ) {
        if ( !pgResult.rows || !pgResult.rows.length ) {
            result = null;
        }

        else if ( pgResult.rows.length === 1 ) {
            let row = pgResult.rows[0];
            let values = Object.values(row);

            result = values[0];
        }
    }

    else {
        result = pgResult.rows || [];
    }
    
    return result;
}

module.exports = customReturning;