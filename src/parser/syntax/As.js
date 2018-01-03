"use strict";

const Syntax = require("./Syntax");

class As extends Syntax {
    parse(coach) {
        let needAlias = false;
        this.alias = null;
        
        if ( coach.isWord("as") ) {
            coach.readWord();
            coach.skipSpace();
            needAlias = true;
        }
        
        if ( coach.isDoubleQuotes() ) {
            this.alias = coach.parseDoubleQuotes();
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
                this.alias = word;
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
}

As.tests = [
    {
        str: "nice",
        result: {
            alias: "nice"
        }
    },
    {
        str: "\" Yep\"",
        result: {
            alias: {
                content: " Yep"
            }
        }
    },
    {
        str: "as Some1",
        result: {
            alias: "some1"
        }
    },
    {
        str: "as \"order\"",
        result: {
            alias: {
                content: "order"
            }
        }
    },
    {
        str: "as from",
        error: Error
    }
];

module.exports = As;
