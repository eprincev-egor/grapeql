"use strict";

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
    "int",
    "numeric"
];
let isSqlNumber = function(type) {
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
let isLikeNumber = function(value) {
    if ( +value !== +value ) {
        return false;
    }

    if ( typeof value == "object" ) {
        return false;
    }

    return true;
};



const textTypes = [
    "text",
    "\"char\""
];
let isSqlText = function(type) {
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

let isLikeText = function(value) {
    switch (typeof value) {
    case "number":
        return true;
    case "string":
        return true;
    }
    return false;
};

let wrapText = function(text) {
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
let isSqlDate = function(type) {
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

let isLikeDate = function(value) {
    if ( value && value.toISOString ) {
        return true;
    }

    // unix timestamp
    if ( typeof value == "number" ) {
        return true;
    }

    return false;
};

let wrapDate = function(value, toType) {
    if ( typeof value == "number" ) {
        value = new Date(value);
    }

    if ( value && value.toISOString ) {
        return `'${ value.toISOString() }'::${ toType }`;
    }
};

let isSqlBoolean = function(type) {
    return type == "boolean";
};

let isLikeBoolean = function(value) {
    return (
        value === true  ||
        value === false ||
        value === 1     ||
        value === 0
    );
};

let value2sql = function(type, value) {
    if ( value == null ) {
        return "null";
    }
    
    if ( isSqlNumber(type) ) {

        if ( isLikeNumber(value)  ) {
            return "" + value;
        } else {
            throw new Error("invalid value for number: " + value);
        }
    }

    else if ( isSqlText(type) ) {
        if ( isLikeText(value) ) {
            return wrapText(value);
        } else {
            throw new Error("invalid value for text: " + value);
        }
    }

    else if ( isSqlDate(type) ) {
        if ( isLikeDate(value) ) {
            return wrapDate(value, type);
        } else {
            throw new Error("invalid value for date: " + value);
        }
    }

    else if ( isSqlBoolean(type) ) {
        if ( isLikeBoolean(value) ) {
            if ( value ) {
                return "true";
            } else {
                return "false";
            }
        } else {
            throw new Error("invalid value for boolean: " + value);
        }
    }

    else {
        throw new Error(`unsoperted type "${ type }`);
    }
};

module.exports = {
    isSqlNumber,
    isLikeNumber,
    isSqlText,
    isLikeText,
    isSqlDate,
    isLikeDate,
    wrapText,
    wrapDate,
    isSqlBoolean,
    isLikeBoolean,
    value2sql
};
