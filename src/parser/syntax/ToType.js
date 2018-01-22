"use strict";

const Syntax = require("./Syntax");

// ::text

class ToType extends Syntax {
    parse(coach) {
        coach.expect("::");
        coach.skipSpace();
        this.dataType = coach.parseDataType();
    }
    
    is(coach, str) {
        return str[0] == ":" && str[1] == ":";
    }
    
    clone() {
        let clone = new ToType();
        clone.dataType = this.dataType.clone();
        return clone;
    }
    
    toString() {
        return "::" + this.dataType.toString();
    }
}

module.exports = ToType;
