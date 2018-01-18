"use strict";

const Operator = require("./Operator");

/*
a           b               result
0           0               true
null        0               false
0           null            false
0           undefined       false
undefined   0               false
*/

const numberTypes = [
    "smallint",
    "integer",
    "bigint",
    "decimal",
    "real",
    "double precision",
    "smallserial",
    "serial",
    "bigserial",
    "int"
];
function isSqlNumber(type) {
    if ( numberTypes.includes(type.toLowerCase()) ) {
        return true;
    }
    
    if ( /^numeric\s*\(\s*\d+\s*(\s*,\s*\d+\s*)?\)\s*$/.test(type) ) {
        return true;
    }
    
    return false;
}

// 42
// 3.5
// 4.
// .001
// 5e2
// 1.925e-3
// 12345565556677889453645645645645645    js not support big numbers
// is not NaN, but can be Infinity, and is not null and is not [0]
function isLikeNumber(value) {
    if ( +value !== +value ) {
        return false;
    }
    
    if ( typeof value == "object") {
        return false;
    }
    
    return true;
}

class Equal extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        return left + " == " + JSON.stringify(right);
    }
    
    compile2sql(column, value) {
        if ( isSqlNumber(column.type) ) {
            
            if ( isLikeNumber(value)  ) { 
                return column.sql + " = " + value;
            } else {
                throw new Error("invalid value for number equal: " + value);
            }
        }
    }
}

Operator.addLiteral(["=", "equal", "=="], Equal);

module.exports = Equal;