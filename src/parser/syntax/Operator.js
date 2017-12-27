"use strict";

const Syntax = require("../syntax/Syntax");

class Operator extends Syntax {
    parse(coach) {
        let operator = "";
        
        if ( coach.isWord("operator") ) {
            coach.readCurrentWord();
            coach.skipSpace();
            coach.expect("(");
            coach.expect(")");
        }
        
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( !/[+\-*/%~=<>!&|^]/.test(symb) ) {
                break;
            }
            
            operator += symb;
        }
        
        this.operator = operator;
    }
    
    is(coach, str) {
        return (
            (
                "+-*/%~=<>!&|^".indexOf(str[0]) != -1 ||
                coach.isWord("operator")
            ) && 
            !(str[0] == "-" && str[1] == "-") && // -- comment
            !(str[0] == "/" && str[1] == "*") // /* comment
        ); 
    }
}

Operator.tests = [
    {
        str: "+",
        result: {operator: "+"}
    },
    {
        str: ">= ",
        result: {operator: ">="}
    },
    {
        str: "<> ",
        result: {operator: "<>"}
    }
];

module.exports = Operator;
