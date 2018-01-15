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
}

Operator.addLiteral(["in"], In);

module.exports = In;