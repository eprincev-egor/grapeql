"use strict";

const Syntax = require("./Syntax");

class CaseWhenElement extends Syntax {
    parse(coach) {
        coach.expectWord("when");
        coach.skipSpace();
        
        this.when = coach.parseExpression();
        coach.skipSpace();
        
        coach.expectWord("then");
        coach.skipSpace();
        
        this.then = coach.parseExpression();
    }
    
    is(coach) {
        return coach.isWord("when");
    }
    
    clone() {
        let clone = new CaseWhenElement();
        clone.when = this.when.clone();
        clone.then = this.then.clone();
        return clone;
    }
    
    toString() {
        // !! .toString()
        return `when ${ this.when } then ${ this.then }`;
    }
}

module.exports = CaseWhenElement;
