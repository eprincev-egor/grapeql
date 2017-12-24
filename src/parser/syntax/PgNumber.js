"use strict";
const Syntax = require("../syntax/Syntax");

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
            this.value = intPart + "." + floatPart;
        } else {
            this.value = intPart;
        }
        
        if ( ePart ) {
            this.value += "e" + ePart;
        }
        
        this.numb = +this.value;
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
        result: {value: "1", numb: 1}
    },
    {
        str: "1234567890",
        result: {value: "1234567890", numb: 1234567890}
    },
    {
        str: "3.2",
        result: {value: "3.2", numb: 3.2}
    },
    {
        str: "5e2",
        result: {value: "5e2", numb: 5e2}
    },
    {
        str: ".001",
        result: {value: ".001", numb: .001}
    },
    {
        str: "1.925e-3",
        result: {value: "1.925e-3", numb: 1.925e-3}
    },
    {
        str: "1.925e+3",
        result: {value: "1.925e+3", numb: 1.925e+3}
    }
];

module.exports = PgNumber;
