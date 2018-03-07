"use strict";

const Operator = require("./Operator");

class Lesser extends Operator {
    validateValue(value) {
        if ( +value !== +value ) {// is not NaN
            return false;
        }
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        if ( right == null ) {
            return "false";
        }

        right = JSON.stringify( right );
        return left + " != null && " + right + " != null && +" + left + " < +" + right;
    }
    
    compile2sql(column, value) {
        return Operator.toSql(column, "<", value);
    }
}

Operator.addLiteral(["<"], Lesser);

module.exports = Lesser;
