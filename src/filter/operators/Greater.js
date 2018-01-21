"use strict";

const Operator = require("./Operator");

class Greater extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        if ( right == null ) {
            return "false";
        }

        right = JSON.stringify( right );
        return left + " != null && " + left + " > +" + right;
    }
    
    compile2sql(column, value) {
        return Operator.toSql(column, ">", value);
    }
}

Operator.addLiteral([">"], Greater);

module.exports = Greater;
