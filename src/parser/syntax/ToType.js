"use strict";

const Syntax = require("../syntax/Syntax");

// ::text

class ToType extends Syntax {
    parse(coach) {
        coach.expect("::");
        coach.skipSpace();
        this.dataType = coach.parseDataType();
    }
    
    is(coach, str) {
        return str[0] == ":" && str[1] == ":";
    }
}

ToType.tests = [
    {
        str: "::text",
        result: {
            dataType: {
                type: "text"
            }
        }
    },
    {
        str: "::  bigint[] ",
        result: {
            dataType: {
                type: "bigint[]"
            }
        }
    }
];

module.exports = ToType;
