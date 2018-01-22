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
    
    clone() {
        let clone = new CaseWhen();
        
        clone.case = this.case.map(elem => elem.clone());
        clone.else = null;
        
        if ( this.else ) {
            clone.else = this.else.clone();
        }
        
        return clone;
    }
    
    toString() {
        let out = "case";
        
        let cases = this.cases.map(elem => elem.toString());
        out += cases;
        
        if ( this.else ) {
            out += " else ";
            out += this.else.toString();
            out += " ";
        }
        
        out += "end";
        return out;
    }
}

module.exports = CaseWhen;
