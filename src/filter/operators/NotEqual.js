"use strict";

const Operator = require("./Operator");

class NotEqual extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        right = JSON.stringify( right );
        return left + " != " + right;
    }
}

Operator.addLiteral(["<>", "!="], NotEqual);

module.exports = NotEqual;
