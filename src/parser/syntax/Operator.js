"use strict";

const Syntax = require("../syntax/Syntax");

class Operator extends Syntax {
    parse(coach) {
        let value = "";
        
        if ( coach.is(/operator/) ) {
            coach.readCurrentWord();
            coach.skipSpace();
            coach.expectRead("(");
            coach.expectRead(")");
        }
        
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( !/[+\-*/%~=<>!&|^]/.test(symb) ) {
                break;
            }
            
            value += symb;
        }
        
        this.value = value;
    }
    
    is(coach, str) {
        return (
            (
                "+-*/%~=<>!&|^".indexOf(str[0]) != -1 ||
                coach.is(/operator/i)
            ) && 
            !(str[0] == "-" && str[1] == "-") && // -- comment
            !(str[0] == "/" && str[1] == "*") // /* comment
        ); 
    }
}

Operator.tests = [
    {
        str: "+",
        result: {value: "+"}
    }
];

module.exports = Operator;
