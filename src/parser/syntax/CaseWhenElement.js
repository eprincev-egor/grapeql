"use strict";

const Syntax = require("../syntax/Syntax");

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

CaseWhenElement.tests = [
    {
        str: "when true then 1",
        result: {
            when: {elements: [{boolean: true}]},
            then: {elements: [{number: "1"}]}
        }
    }
];

module.exports = CaseWhenElement;