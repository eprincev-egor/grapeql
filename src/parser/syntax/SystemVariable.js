"use strict";

const Syntax = require("../syntax/Syntax");

class SystemVariable extends Syntax {
    parse(coach) {
        coach.expect("{");
        
        this.name = "";
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( symb == "}" ) {
                break;
            }
            
            this.name += symb;
        }
        
        if ( !this.name ) {
            coach.throwError("expect variable name");
        }
        
        coach.expect("}");
    }
    
    is(coach, str) {
        return /^\{\w+\}/.test(str);
    }
}

SystemVariable.tests = [
    {
        str: "{x}",
        result: {name: "x"}
    },
    {
        str: "{X}",
        result: {name: "X"}
    },
    {
        str: "{$Any_Variable}",
        result: {name: "$Any_Variable"}
    },
    {
        str: "{Привет}",
        result: {name: "Привет"}
    },
    {
        str: "{}",
        error: Error
    }
];

module.exports = SystemVariable;
