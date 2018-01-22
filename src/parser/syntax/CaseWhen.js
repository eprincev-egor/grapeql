"use strict";

const Syntax = require("./Syntax");

class CaseWhen extends Syntax {
    parse(coach) {
        
        coach.expectWord("case");
        coach.skipSpace();
        
        this.case = [];
        this.parseElement(coach);
        
        coach.skipSpace();
        if ( coach.isWord("else") ) {
            coach.readWord();
            coach.skipSpace();
            this.else = coach.parseExpression();
            coach.skipSpace();
        } else {
            this.else = null;
        }
        
        coach.expectWord("end");
    }
    
    parseElement(coach) {
        let elem = coach.parseCaseWhenElement();
        this.case.push(elem);
        
        coach.skipSpace();
        if ( coach.isCaseWhenElement() ) {
            this.parseElement(coach);
        }
    }
    
    is(coach) {
        return coach.isWord("case");
    }
}

module.exports = CaseWhen;
