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
}

module.exports = CaseWhenElement;
