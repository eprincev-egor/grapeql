"use strict";

const Syntax = require("./Syntax");

class ObjectName extends Syntax {
    parse(coach) {
        if ( coach.isDoubleQuotes() ) {
            this.name = coach.parseDoubleQuotes();
        }
        else {
            let word = coach.expectWord();
            this.name = new Syntax.Word( word );
        }
        this.addChild(this.name);
    }
    
    is(coach) {
        return coach.isDoubleQuotes() || coach.isWord();
    }
    
    clone() {
        let clone = new ObjectName();
        clone.name = this.name.clone();
        clone.addChild(this.name);
        return clone;
    }
    
    toString() {
        return this.name.toString();
    }
}

module.exports = ObjectName;
