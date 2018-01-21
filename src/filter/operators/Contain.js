"use strict";

const Operator = require("./Operator");

class Contain extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }
    
    compile2js(left, right) {
        if ( right == null ) {
            right = "";
        }
        right = right + "";
        right = right.toLowerCase();
        right = JSON.stringify( right );

        // _lowercase @see RowModel.parse2filter
        return "( " + left + " && " + left + "._lowerCase || (" + left + " + '').toLowerCase() ).indexOf( " + right + " ) !== -1";
    }
    
    compile2sql(column, value) {
        if ( column ) {
            
        }
    }
}

Operator.addLiteral(["contain"], Contain);

module.exports = Contain;
