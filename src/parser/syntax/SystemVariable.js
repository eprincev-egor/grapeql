"use strict";

const Syntax = require("../syntax/Syntax");

class SystemVariable extends Syntax {
    parse(coach) {
        coach.expectRead("@");
        
        this.name = "";
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( /[^\w$]/.test(symb) ) {
                break;
            }
            
            this.name += symb;
        }
        
        if ( !this.name ) {
            coach.throwError("expect variable name");
        }
    }
    
    is(coach, str) {
        return str.test(/^@\w/);
    }
}

SystemVariable.tests = [
    {
        str: "@x",
        result: {name: "x"}
    },
    {
        str: "@X",
        result: {name: "X"}
    },
    {
        str: "@$Any_Variable",
        result: {name: "$Any_Variable"}
    },
    {
        str: "@",
        error: Error
    }
];

module.exports = SystemVariable;
