"use strict";

const Syntax = require("./Syntax");

class FilePathElement extends Syntax {
    parse(coach) {
        this.name = coach.read(/[^\s/]+/);
    }
    
    is(coach) {
        return coach.is(/[^\s/]/);
    }
    
    clone() {
        let clone = new FilePathElement();
        clone.name = this.name;
        return clone;
    }
    
    toString() {
        return this.name;
    }
}

module.exports = FilePathElement;
