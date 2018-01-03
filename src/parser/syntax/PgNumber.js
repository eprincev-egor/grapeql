"use strict";
const Syntax = require("./Syntax");

// 42
// 3.5
// 4.
// .001
// 5e2
// 1.925e-3

class PgNumber extends Syntax {
    parse(coach) {
        let intPart = "",
            floatPart = "",
            ePart = "";
        
        intPart = this.readDigits( coach );
        if ( coach.is(".") ) {
            coach.i++;
            floatPart = this.readDigits( coach );
        }
        
        if ( coach.is("e") || coach.is("E") ) {
            coach.i++;
            
            if ( coach.is("+") || coach.is("-") ) {
                ePart = coach.str[ coach.i ];
                coach.i++;
            }
            
            ePart += this.readDigits( coach );
        }
        
        
        if ( floatPart ) {
            this.number = intPart + "." + floatPart;
        } else {
            this.number = intPart;
        }
        
        if ( ePart ) {
            this.number += "e" + ePart;
        }
    }
    
    readDigits(coach) {
        let digits = "";
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( /\d/.test(symb) ) {
                digits += symb;
            } else {
                break;
            }
        }
        return digits;
    }
    
    is(coach, str) {
        return str.search(/[\d.]/) === 0;
    }
}

PgNumber.tests = [
    {
        str: "1",
        result: {number: "1"}
    },
    {
        str: "1234567890",
        result: {number: "1234567890"}
    },
    {
        str: "3.2",
        result: {number: "3.2"}
    },
    {
        str: "5e2",
        result: {number: "5e2"}
    },
    {
        str: ".001",
        result: {number: ".001"}
    },
    {
        str: "1.925e-3",
        result: {number: "1.925e-3"}
    },
    {
        str: "1.925e+3",
        result: {number: "1.925e+3"}
    }
];

module.exports = PgNumber;
