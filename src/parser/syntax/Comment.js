"use strict";

const Syntax = require("./Syntax");

class Comment extends Syntax {
    parse(coach) {
        let content = "";
        
        if ( coach.is("-") ) {
            coach.expect("--");
            
            for (; coach.i < coach.n; coach.i++) {
                let symb = coach.str[ coach.i ];
                
                if ( /[\n\r]/.test(symb) ) {
                    break;
                }
                
                content += symb;
            }
        } else {
            coach.expect("/*");
            
            for (; coach.i < coach.n; coach.i++) {
                let symb = coach.str[ coach.i ];
                
                if ( symb == "*" && coach.str[ coach.i + 1 ] == "/" ) {
                    coach.i += 2;
                    break;
                }
                
                content += symb;
            }
        }
        
        this.content = content;
    }
    
    is(coach, str) {
        return (
            str[0] == "-" && str[1] == "-" ||
            str[0] == "/" && str[1] == "*"
        );
    }
}

module.exports = Comment;
