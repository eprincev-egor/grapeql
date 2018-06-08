"use strict";

const _ = require("lodash");
const {
    isSqlNumber,
    isLikeNumber,
    isSqlText,
    isLikeText,
    isSqlDate,
    isLikeDate,
    wrapText,
    wrapDate
} = require("../../helpers");

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
            ||
            
            // or date
            isLikeDate(anyValue)
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



Operator.toSql = function(column, sqlOperator, value) {
    if ( isSqlNumber(column.type) ) {
        
        if ( isLikeNumber(value)  ) { 
            return `${column.sql} ${sqlOperator} ${value}`;
        } else {
            throw new Error("invalid value for number: " + value);
        }
    }
    
    else if ( isSqlText(column.type) ) {
        if ( isLikeText(value) ) {
            return `${column.sql} ${sqlOperator} ${wrapText(value)}`;
        } else {
            throw new Error("invalid value for text: " + value);
        }
    }
    
    else if ( isSqlDate(column.type) ) {
        if ( isLikeDate(value) ) {
            return `${column.sql} ${sqlOperator} ${wrapDate(value, column.type)}`;
        } else {
            throw new Error("invalid value for date: " + value);
        }
    }
    
    else {
        throw new Error(`unsoperted type "${ column.type } for operator ${ sqlOperator }"`);
    }
};

module.exports = Operator;
