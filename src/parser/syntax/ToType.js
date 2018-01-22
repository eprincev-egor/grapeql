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
}

module.exports = ToType;
