"use strict";

const Syntax = require("./Syntax");

class ObjectName extends Syntax {
    parse(coach) {
        if ( coach.isDoubleQuotes() ) {
            this.name = coach.parseDoubleQuotes();
        }
        else {
            this.name = {word: coach.expectWord()};
        }
    }
    
    is(coach) {
        return coach.isDoubleQuotes() || coach.isWord();
    }
}

ObjectName.tests = [
    {
        str: "a",
        result: {
            name: {word: "a"}
        }
    },
    {
        str: "\"Nice\"",
        result: {
            name: {
                content: "Nice"
            }
        }
    }
];

module.exports = ObjectName;
