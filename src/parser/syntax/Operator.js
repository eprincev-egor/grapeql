"use strict";

const Syntax = require("./Syntax");

class Operator extends Syntax {
    parse(coach) {
        let operator = "";
        
        if ( coach.isWord("operator") ) {
            coach.readWord();
            coach.skipSpace();
            coach.expect("(");
            coach.skipSpace();
            let link = coach.read(/[^)]+/);
            link = link.trim();
            
            if ( !link ) {
                coach.throwError("invalid operator");
            }
            this.operator = "operator(" + link + ")";
            coach.skipSpace();
            coach.expect(")");
            return;
        }
        
        // check condition operators
        let index = coach.i;
        let word = coach.readWord().toLowerCase();
        if ( word == "and" ) {
            this.operator = "and";
        }
        
        else if ( word == "or" ) {
            this.operator = "or";
        }
        
        else if ( word == "not" ) {
            this.operator = "not";
        }
        
        else if ( word == "is" ) {
            if ( coach.is(/\s+not/i) ) {
                coach.skipSpace();
                coach.expectWord("not");
                this.operator = "is not";
            }
            
            else if ( coach.is(/\s+d/i) ) {
                coach.skipSpace();
                coach.expectWord("distinct");
                coach.skipSpace();
                coach.expectWord("from");
                this.operator = "is distinct from";
            }
            
            else {
                this.operator = "is";
            }
        }
        
        // another
        else {
            coach.i = index;
            
            for (; coach.i < coach.n; coach.i++) {
                let symb = coach.str[ coach.i ];
                
                // -+ must be as two operators
                if ( symb == "-" ) {
                    operator = "-";
                    coach.i++;
                    break;
                }
                
                if ( !/[+\-*/%~=<>!&|^]/.test(symb) ) {
                    break;
                }
                
                operator += symb;
            }
            
            this.operator = operator;
        }
    }
    
    is(coach, str) {
        return (
            (
                "+-*/%~=<>!&|^".indexOf(str[0]) != -1 ||
                coach.isWord("operator") ||
                coach.isWord("and") ||
                coach.isWord("or") ||
                coach.isWord("not") ||
                coach.isWord("is")
            ) && 
            !(str[0] == "-" && str[1] == "-") && // -- comment
            !(str[0] == "/" && str[1] == "*") // /* comment
        ); 
    }
}

module.exports = Operator;
