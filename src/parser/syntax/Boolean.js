"use strict";

const Syntax = require("../syntax/Syntax");

// true or false

class Boolean extends Syntax {
    parse(coach) {
        if ( coach.is(/t/i) ) {
            coach.expectWord("true");
            this.boolean = true;
        } else {
            coach.expectWord("false");
            this.boolean = false;
        }
    }
    
    is(coach) {
        return coach.isWord("true") || coach.isWord("false");
    }
}

Boolean.tests = [
    {
        str: "true",
        result: {
            boolean: true
        }
    },
    {
        str: "false",
        result: {
            boolean: false
        }
    }
];

module.exports = Boolean;
