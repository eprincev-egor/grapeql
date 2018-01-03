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

Comment.tests = [
    {
        str: "--123\n",
        result: {content: "123"}
    },
    {
        str: "--123\r",
        result: {content: "123"}
    },
    {
        str: "/*123\n456*/",
        result: {content: "123\n456"}
    },
    {
        str: "/*123\r456*/",
        result: {content: "123\r456"}
    }
];

module.exports = Comment;
