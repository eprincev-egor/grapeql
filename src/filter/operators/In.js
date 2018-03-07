"use strict";

const Operator = require("./Operator");
const _ = require("lodash");

class In extends Operator {
    validateValue(value) {
        return _.every(this.validateLiteral, value);
    }

    compile2js(left, right) {
        if ( !_.isArray(right) || !right.length ) {
            return "false";
        }

        let value,
            result = "(";

        for (let i = 0, n = right.length; i < n; i++) {
            value = right[ i ];
            if ( value == null ) {
                value = null;
            }

            if ( i > 0 ) {
                result += " || ";
            }
            result += left + " == " + JSON.stringify( value );
        }

        result += ")";

        return result;
    }
    
    compile2sql(column, elems) {
        let out = column.sql + " in ";
        
        if ( Operator.isSqlNumber(column.type) ) {
            out += "("; 
            out += elems.map(value => {
                if ( Operator.isLikeNumber(value) ) {
                    return value;
                } else {
                    throw new Error("invalid value for number: " + value);
                }
            }).join(",");
            out += ")";
        }
        
        else if ( Operator.isSqlText(column.type) ) {
            out += "(";
            out += elems.map(value => {
                if ( Operator.isLikeText(value) ) {
                    return Operator.wrapText( value );
                } else {
                    throw new Error("invalid value for text: " + value);
                }
            }).join(",");
            out += ")";
        }
        
        return out;
    }
}

Operator.addLiteral(["in"], In);

module.exports = In;
