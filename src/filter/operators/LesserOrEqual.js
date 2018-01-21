"use strict";

const Operator = require("./Operator");

class LesserOrEqual extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        if ( right == null ) {
            return "false";
        }

        right = JSON.stringify( right );
        return left + " != null && " + right + " != null && +" + left + " <= +" + right;
    }
    
    compile2sql(column, value) {
        return Operator.toSql(column, "<=", value);
    }
}

Operator.addLiteral(["<="], LesserOrEqual);

module.exports = LesserOrEqual;
