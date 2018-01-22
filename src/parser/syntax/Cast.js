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
    
    clone() {
        let clone = new Cast();
        clone.expression = this.expression.clone();
        clone.dataType = this.dataType.clone();
        return clone;
    }
    
    toString() {
        // !! .toString()
        return `cast(${ this.expression } as ${ this.dataType })`;
    }
}

module.exports = Cast;
