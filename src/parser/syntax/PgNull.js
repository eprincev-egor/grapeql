"use strict";

const Syntax = require("../syntax/Syntax");

class PgNull extends Syntax {
    parse(coach) {
        coach.expectWord("null");
    }
    
    is(coach) {
        return coach.is(/null[^\w]/i);
    }
}

PgNull.tests = [
    {
        str: "null",
        result: {}
    },
    {
        str: "null ",
        result: {}
    },
    {
        str: "null1",
        error: Error
    }
];

module.exports = PgNull;
