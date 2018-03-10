"use strict";

const Operator = require("./Operator");
const _ = require("lodash");

class NoRows extends Operator {
    validateValue(value) {
        return _.isString(value) && value.trim().toLowerCase() === "norows";
    }

    compile2js() {
        return "false";
    }
    
    compile2sql() {
        return "false";
    }
}

Operator.addLiteral(["noRows"], NoRows);

module.exports = NoRows;