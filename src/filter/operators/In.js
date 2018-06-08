"use strict";

const Operator = require("./Operator");
const _ = require("lodash");
const {
    isSqlNumber,
    isLikeNumber,
    isSqlText,
    isLikeText,
    isSqlDate,
    isLikeDate,
    wrapText,
    wrapDate
} = require("../../helpers");

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
        if ( !_.isArray(elems) || !elems.length ) {
            return "false";
        }
        
        let out = column.sql + " in ";
        
        if ( isSqlNumber(column.type) ) {
            out += "("; 
            out += elems.map(value => {
                if ( isLikeNumber(value) ) {
                    return value;
                } else {
                    throw new Error("invalid value for number: " + value);
                }
            }).join(",");
            out += ")";
        }
        
        else if ( isSqlText(column.type) ) {
            out += "(";
            out += elems.map(value => {
                if ( isLikeText(value) ) {
                    return wrapText( value );
                } else {
                    throw new Error("invalid value for text: " + value);
                }
            }).join(",");
            out += ")";
        }
        
        else if ( isSqlDate(column.type) ) {
            out += "(";
            out += elems.map(value => {
                if ( isLikeDate(value) ) {
                    return wrapDate( value, column.type );
                } else {
                    throw new Error("invalid value for date: " + value);
                }
            }).join(",");
            out += ")";
        }
        
        return out;
    }
}

Operator.addLiteral(["in"], In);

module.exports = In;
