"use strict";

const _ = require("lodash");

class Operator {
    constructor(literal) {
        this.literal = literal;
    }

    validateValue(/* anyValue */) {
        return true;
    }

    validateLiteral(anyValue) {
        return (
            // null or undfeind
            anyValue == null ||

            // value must be
            // string
            _.isString(anyValue) ||

            // or number
            _.isNumber(anyValue) &&
            !_.isNaN(anyValue)
        );
    }

    compile(/* left, right */) {
        return "true";
    }
}


Operator.byLiteral = {};
Operator.create = function(literal) {
    let ChildOperator = Operator.byLiteral[ literal.toLowerCase().trim() ];

    if ( !_.isFunction(ChildOperator) ) {
        throw new Error("unknown operator literal: " + literal);
    }

    return new ChildOperator(literal);
};

Operator.addLiteral = function(literal, ChildOperator) {
    _.each(literal, literal => {
        literal = literal.toLowerCase().trim();
        
        if ( literal in Operator.byLiteral ) {
            throw new Error( "dublicate literal: " + literal );
        }
        
        Operator.byLiteral[ literal ] = ChildOperator;
    });
};

module.exports = Operator;
