"use strict";

const Syntax = require("./Syntax");

class As extends Syntax {
    parse(coach) {
        let needAlias = false;
        this.alias = null;
        
        if ( coach.isWord("as") ) {
            coach.expect("as");
            coach.skipSpace();
            needAlias = true;
            this.hasWordAs = true;
        }
        
        if ( coach.isDoubleQuotes() ) {
            this.alias = coach.parseDoubleQuotes();
            this.addChild(this.alias);
            return;
        }
        
        if ( coach.isWord() ) {
            let index = coach.i;
            let word = coach.readWord().toLowerCase();
            
            if ( this.Coach.Select.keywords.includes(word) ) {
                coach.i = index;
                
                if ( needAlias ) {
                    // in fact, there may be keywords, except for some.
                    // for example select id as group from company
                    // will be valid, but it is recommended that you use double quotes
                    coach.throwError("unexpected keyword: " + word);
                }
            } else {
                this.alias = new Syntax.Word(word);
                this.addChild(this.alias);
            }
        }
    }
    
    is(coach) {
        if ( coach.isDoubleQuotes() ) {
            return true;
        }
        
        if ( coach.isWord() ) {
            let i = coach.i;
            let word = coach.readWord().toLowerCase();
            coach.i = i;
            
            return word == "as" || !this.Coach.Select.keywords.includes(word);
        }
        
        return false;
    }
    
    clone() {
        let clone = new As();
        
        if ( !this.alias ) {
            clone.alias = null;
            return clone;
        }
        
        clone.alias = this.alias.clone();
        clone.addChild(clone.alias);
        
        return clone;
    }
    
    toString() {
        if ( !this.alias ) {
            return "";
        }
        
        let out = this.alias.toString();
        
        if ( this.hasWordAs ) {
            out = "as " + out;
        }
        
        return out;
    }
}

module.exports = As;
