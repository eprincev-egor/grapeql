"use strict";

const SKIP_KEYS = ["coach", "Coach", "parent", "startIndex", "endIndex", "children", "_source"];

function normolizeSyntaxBeforePrint(value) {
    if ( Array.isArray(value) ) {
        return value.map(normolizeSyntaxBeforePrint);
    }
    else if ( value && typeof value == "object" ) {
        let clone = {};
        let syntax = value;
        
        for (let key in syntax) {
            let value = syntax[ key ];
            
            if ( SKIP_KEYS.includes(key) ) {
                continue;
            }
            
            clone[ key ] = normolizeSyntaxBeforePrint( value );
        }
        
        return clone;
    } 
    else {
        return value;
    }
}

module.exports = normolizeSyntaxBeforePrint;