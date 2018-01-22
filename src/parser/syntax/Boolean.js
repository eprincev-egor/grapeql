"use strict";

const Syntax = require("./Syntax");

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

module.exports = Boolean;
