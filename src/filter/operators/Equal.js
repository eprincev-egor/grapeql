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

class Equal extends Operator {
    validateValue(value) {
        return this.validateLiteral(value);
    }

    compile2js(left, right) {
        return left + " == " + JSON.stringify(right);
    }
    
    compile2sql(column, value) {
        return Operator.toSql(column, "=", value);
    }
}

Operator.addLiteral(["=", "equal", "=="], Equal);

module.exports = Equal;
