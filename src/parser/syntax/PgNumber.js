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
    
    clone() {
        let clone = new PgNumber();
        clone.number = this.number;
        return clone;
    }
    
    toString() {
        return this.number;
    }
}

module.exports = PgNumber;
