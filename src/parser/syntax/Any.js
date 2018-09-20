"use strict";

const Syntax = require("./Syntax");

class Any extends Syntax {
    parse(coach) {
        if ( coach.isWord("any") ) {
            coach.expectWord("any");
            this.type = "any";
        }
        else if ( coach.isWord("all") ) {
            coach.expectWord("all");
            this.type = "all";
        }
        else {
            coach.expectWord("some");
            this.type = "some";
        }

        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        if ( coach.isSelect() ) {
            this.select = coach.parseSelect();
            this.addChild( this.select );
        } else {
            this.array = coach.parseExpression();
            this.addChild( this.array );
        }
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        let isKeyword = (
            coach.isWord("any") ||
            coach.isWord("all") ||
            coach.isWord("some")
        );
            
        if ( !isKeyword ) {
            return false;
        }

        let i = coach.i;
        coach.readWord();
        coach.skipSpace();

        let isBracket = coach.is("(");
        coach.i = i;
        
        return isKeyword && isBracket;
    }
    
    clone() {
        let clone = new Any();

        clone.type = this.type;
        
        if ( this.select ) {
            clone.select = this.select.clone();
            clone.addChild(clone.select);
        } else {
            clone.array = this.array.clone();
            clone.addChild(clone.array);
        }
        
        return clone;
    }
    
    toString() {
        if ( this.select ) {
            return `${this.type} (${ this.select })`;
        } else {
            return `${this.type} (${ this.array })`;
        }
    }
    
    getType() {
        return "boolean";
    }
}

module.exports = Any;
