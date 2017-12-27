"use strict";

const Syntax = require("../syntax/Syntax");

class PgNull extends Syntax {
    parse(coach) {
        coach.expectWord("null");
        this.null = true;
    }
    
    is(coach) {
        return coach.isWord("null");
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
