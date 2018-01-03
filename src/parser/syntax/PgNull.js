"use strict";

const Syntax = require("./Syntax");

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
        result: {null: true}
    },
    {
        str: "null ",
        result: {null: true}
    },
    {
        str: "null1",
        error: Error
    }
];

module.exports = PgNull;
