"use strict";

const Operator = require("./Operator");
const {
    isSqlNumber,
    isSqlDate,
    wrapText
} = require("../../helpers");

class Contain extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }
    
    compile2js(left, right) {
        if ( right == null ) {
            // it logic need for next case:
            // 
            // filter = ["NAME", "contain", someModel.get("NAME")]
            // if someModel.get("NAME") is null then need return false
            // 
            return "false";
        }
        right = right + "";
        right = right.toLowerCase();
        right = JSON.stringify( right );

        // _lowercase @see RowModel.parse2filter
        return "( " + left + " && " + left + "._lowerCase || (" + left + " + '').toLowerCase() ).indexOf( " + right + " ) !== -1";
    }
    
    compile2sql(column, value) {
        if ( value == null ) {
            return "false";
        }
        
        value += "";
        value = value.toLowerCase();
        
        value = value.replace(/([%_\\])/g, "\\$1");
        value = wrapText( "%" + value + "%" );
        
        let columnSql = column.sql;
        
        if ( isSqlNumber(column.type) ) {
            columnSql = column.sql + "::text";
        }
        else if ( isSqlDate(column.type) ) {
            columnSql = column.sql + "::date::text";
        }
        
        return columnSql + " ilike " + value;
    }
}

Operator.addLiteral(["contain"], Contain);

module.exports = Contain;
