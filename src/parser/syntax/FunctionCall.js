"use strict";

const Syntax = require("./Syntax");

// some(1,2)

class FunctionCall extends Syntax {
    parse(coach) {
        this.function = coach.parseObjectLink();
        
        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        this.arguments = coach.parseComma("Expression");
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        let i = coach.i,
            result = false;
        
        try {
            coach.parseObjectLink();
            coach.skipSpace();
            result = coach.is("(");
        } catch(err) {
            result = false;
        }
        
        coach.i = i;
        return result;
    }
}

module.exports = FunctionCall;
