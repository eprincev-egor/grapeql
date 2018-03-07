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


const numberTypes = [
    "smallint",
    "integer",
    "bigint",
    "decimal",
    "real",
    "double precision",
    "smallserial",
    "serial",
    "bigserial",
    "int"
];
Operator.isSqlNumber = function(type) {
    if ( numberTypes.includes(type.toLowerCase()) ) {
        return true;
    }
    
    if ( /^numeric\s*\(\s*\d+\s*(\s*,\s*\d+\s*)?\)\s*$/i.test(type) ) {
        return true;
    }
    
    return false;
};

// 42
// 3.5
// 4.
// .001
// 5e2
// 1.925e-3
// 12345565556677889453645645645645645    js not support big numbers
// is not NaN, but can be Infinity, and is not null and is not [0]
Operator.isLikeNumber = function(value) {
    if ( +value !== +value ) {
        return false;
    }
    
    if ( typeof value == "object") {
        return false;
    }
    
    return true;
};



const textTypes = [
    "text",
    "\"char\""
];
Operator.isSqlText = function(type) {
    if ( textTypes.includes(type.toLowerCase()) ) {
        return true;
    }
    
    // "character varying(n)",
    // "varchar(n)",
    // "character(n)",
    // "char(n)",
    if ( /^\s*character\s+varying\s*\(\s*\d+\s*\)\s*$|^\s*varchar\s*\(\s*\d+\s*\)\s*$|^\s*character\s*\(\s*\d+\s*\)\s*$|^\s*char\s*\(\s*\d+\s*\)\s*$/i.test( type ) ) {
        return true;
    }
    
    return false;
};

Operator.isLikeText = function(value) {
    switch (typeof value) {
    case "number":
        return true;
    case "string":
        return true;
    }
    return false;
};

Operator.wrapText = function(text) {
    text += "";
    let tag = "tag";
    let index = 1;
    while ( text.indexOf("$tag" + index + "$") != -1 ) {
        index++;
    }
    tag += index;
    
    return `$${tag}$${ text }$${tag}$`;
};



const dateTypes = [
    "date",
    "timestamp"
];
Operator.isSqlDate = function(type) {
    if ( dateTypes.includes(type.toLowerCase()) ) {
        return true;
    }
    
    // timestamp without time zone
    // timestamp with time zone
    if ( /^\s*timestamp\s+(with|without)\s+time\s+zone$/i.test(type) ) {
        return true;
    }
    
    return false;
};

Operator.isLikeDate = function(value) {
    if ( value && value.toISOString ) {
        return true;
    }
    
    // unix timestamp
    if ( typeof value == "number" ) {
        return true;
    }
    
    return false;
};

Operator.wrapDate = function(value) {
    if ( value && value.toISOString ) {
        return `'${ value.toISOString() }'::timestamp with time zone`;
    }
    
    if ( typeof value == "number" ) {
        return 1;
    }
};


Operator.toSql = function(column, sqlOperator, value) {
    if ( Operator.isSqlNumber(column.type) ) {
        
        if ( Operator.isLikeNumber(value)  ) { 
            return `${column.sql} ${sqlOperator} ${value}`;
        } else {
            throw new Error("invalid value for number: " + value);
        }
    }
    
    else if ( Operator.isSqlText(column.type) ) {
        if ( Operator.isLikeText(value) ) {
            return `${column.sql} ${sqlOperator} ${Operator.wrapText(value)}`;
        } else {
            throw new Error("invalid value for text: " + value);
        }
    }
    
    else if ( Operator.isSqlDate(column.type) ) {
        if ( Operator.isLikeDate(value) ) {
            return `${column.sql} ${sqlOperator} ${Operator.wrapDate(value)}`;
        } else {
            throw new Error("invalid value for date: " + value);
        }
    }
    
    else {
        throw new Error(`unsoperted type "${ column.type } for operator ${ sqlOperator }"`);
    }
};

module.exports = Operator;
