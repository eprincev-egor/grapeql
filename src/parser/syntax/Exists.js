"use strict";

const Syntax = require("./Syntax");

class Exists extends Syntax {
    parse(coach) {
        coach.expectWord("exists");
        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        this.select = coach.parseSelect();
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        return coach.isWord("exists");
    }
    
    clone() {
        let clone = new Exists();
        
        clone.select = this.select.clone();
        
        return clone;
    }
    
    toString() {
        return `exists( ${ this.select } )`;
    }
    
    getType() {
        return "boolean";
    }
}

module.exports = Exists;
