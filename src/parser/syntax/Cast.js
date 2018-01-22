"use strict";

const Syntax = require("./Syntax");

class Cast extends Syntax {
    parse(coach) {
        coach.expectWord("cast");
        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        this.expression = coach.parseExpression();
        
        coach.skipSpace();
        coach.expectWord("as");
        coach.skipSpace();
        
        this.dataType = coach.parseDataType();
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        return coach.isWord("cast");
    }
}

module.exports = Cast;
