"use strict";

const Operator = require("./Operator");
const _ = require("lodash");
const {
    isLikeDate,
    wrapDate
} = require("../../helpers");

function clientTime2unixTimestamp(value) {
    if ( value instanceof Date ) {
        return +value;
    }
    
    if ( typeof value == "number" ) {
        return value;
    }
    
    return NaN;
}

class InRange extends Operator {
    validateValue(value) {
        if ( !_.isArray(value) ) {
            return false;
        }
        
        return value.every(elem => (
            _.isObject(elem) && 
            
            elem.start != null && // or undefined
            !_.isNaN(elem.start) && 
            
            elem.end != null && // or undefined
            !_.isNaN(elem.end)
        ));
    }
    
    compile2js(left, right) {
        if ( !_.isArray(right) || !right.length ) {
            return "false";
        }

        let value,
            start, end,
            result = "";

        for (let i = 0, n = right.length; i < n; i++) {
            value = right[ i ];
            start = value && clientTime2unixTimestamp( value.start );
            end = value && clientTime2unixTimestamp( value.end );

            if ( _.isNaN(start) || _.isNaN(end) ) {
                continue;
            }

            if ( result ) {
                result += " || ";
            }
            result += left + " >= " + start + " && " + left + " <= " + end;
        }

        result += "";

        if ( !result ) {
            result = "true";
        } else {
            result = left + " != null && (" + result + ")";
        }

        return result;
    }
    
    compile2sql(column, elems) {
        if ( !_.isArray(elems) || !elems.length ) {
            return "false";
        }
        
        let start, end,
            sql = "",
            columnSql = column.sql;
            
        for (let i = 0, n = elems.length; i < n; i++) {
            let elem = elems[i];
            
            start = elem && elem.start;
            end = elem && elem.end;
            
            if ( !isLikeDate(start) || !isLikeDate(end) ) {
                continue;
            }
            
            start = wrapDate( start, column.type );
            end = wrapDate( end, column.type );
            
            if ( sql ) {
                sql += " or ";
            }
            
            sql += columnSql + " >= " + start + " and " + columnSql + " <= " + end;
        }
        
        return sql;
    }
}

Operator.addLiteral(["inRange"], InRange);

module.exports = InRange;
