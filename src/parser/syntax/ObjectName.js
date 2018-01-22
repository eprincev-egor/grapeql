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

module.exports = ObjectName;
