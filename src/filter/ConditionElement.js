"use strict";

const _ = require("lodash");
const Operator = require("./operators/Operator");
const NoRows = require("./operators/NoRows");

require("./operators/Equal");
require("./operators/NotEqual");
require("./operators/Is");
require("./operators/Contain");
require("./operators/Greater");
require("./operators/Lesser");
require("./operators/GreaterOrEqual");
require("./operators/LesserOrEqual");
require("./operators/In");
require("./operators/InRange");

class ConditionElement {
    constructor(column, operator, anyValue) {
        if ( _.isArray(column) ) {
            anyValue = column[2];
            operator = column[1];
            column = column[0];
        }

        operator = Operator.create(operator);
        let isValidValue = operator.validateValue(anyValue);

        if ( !isValidValue ) {
            throw new Error("(" + operator.constructor.className + ") invalid value: " + anyValue, anyValue);
        }

        if ( !_.isString(column) || !/^\w+$/i.test(column) ) {
            throw new Error("invalid column: " + column);
        }

        this.column = column;
        this.operator = operator;
        this.value = anyValue;

        this.noRows = false;
        if ( this.operator instanceof NoRows ) {
            this.noRows = true;
        }
    }

    compile2js() {
        if ( this.noRows ) {
            return "false";
        }

        // left is variable in compiled function
        let left = this.column,
            right = this.value;

        // undefined, null
        if ( right == null ) {
            right = null;
        }

        return this.operator.compile2js(left, right);
    }

    compile2json() {
        if ( this.noRows ) {
            // битлджус
            return ["noRows", "noRows", "noRows"];
        }

        let value = this.value;
        if ( value == null ) {
            value = null;
        }

        return [this.column, this.operator.literal, value];
    }

    isEmpty() {
        return false;
    }

    hasColumn(column) {
        return this.column == column;
    }
}

module.exports = ConditionElement;
