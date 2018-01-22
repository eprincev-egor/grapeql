"use strict";

const Syntax = require("./Syntax");

class Column extends Syntax {
    parse(coach) {
        this.expression = coach.parseExpression({ posibleStar: true });
        this.as = null;
        
        coach.skipSpace();
        if ( coach.isAs() ) {
            this.as = coach.parseAs();
        }
    }
    
    is(coach) {
        if ( coach.isWord() ) {
            let i = coach.i;
            let word = coach.readWord().toLowerCase();
            coach.i = i;
            
            return !this.Coach.Select.keywords.includes(word);
        }
        
        return coach.is("*") || coach.isExpression();
    }
    
    isStar() {
        if ( this.expression.isLink() ) {
            let link = this.expression.getLink();
            return link.isStar();
        }
    }
    
    clone() {
        let clone = new Column();
        clone.expression = this.expression.clone();
        clone.as = null;
        
        if ( this.as ) {
            clone.as = this.as.clone();
        }
        
        return clone;
    }
    
    toString() {
        let out = this.expression.toString();
        
        if ( this.as ) {
            out += " " + this.as.toString();
        }
        
        return out;
    }
}

module.exports = Column;
