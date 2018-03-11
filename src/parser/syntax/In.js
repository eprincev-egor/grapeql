"use strict";

const Syntax = require("./Syntax");

class In extends Syntax {
    parse(coach) {
        coach.expectWord("in");
        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        if ( coach.isSelect() ) {
            this.in = coach.parseSelect();
            this.addChild( this.in );
        } else {
            this.in = coach.parseComma("Expression");
            this.in.forEach(expression => this.addChild(expression));
        }
        
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        return coach.isWord("in");
    }
    
    clone() {
        let clone = new In();
        
        if ( Array.isArray(this.in) ) {
            clone.in = this.in.map(expression => {
                let expClone = expression.clone();
                clone.addChild(expClone);
                return expClone;
            });
        } else {
            clone.in = this.in.clone();
        }
        
        return clone;
    }
    
    toString() {
        if ( Array.isArray(this.in) ) {
            return `in (${ this.in.join(", ") })`;
        } else {
            return `in (${ this.in })`;
        }
    }
    
    getType() {
        return "boolean";
    }
}

module.exports = In;
