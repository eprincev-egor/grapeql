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
    
    clone() {
        let clone = new FunctionCall();
        clone.function = this.function.clone();
        clone.arguments = this.arguments.map(arg => arg.clone());
        return clone;
    }
    
    toString() {
        let args = this.arguments.map(arg => arg.toString()).join(", ");
        return this.function.toString() + "(" + args + ")";
    }
}

module.exports = FunctionCall;
