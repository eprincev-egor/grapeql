"use strict";

const Syntax = require("./Syntax");

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
    
    clone() {
        let clone = new SystemVariable();
        clone.name = this.name;
        return clone;
    }
    
    toString() {
        return "{" + this.name + "}";
    }
}

module.exports = SystemVariable;
