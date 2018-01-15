"use strict";

class UnaryCondition {
    constructor(literal, condition) {
        this.literal = literal;
        this._literal = literal.toLowerCase().trim();
        this.condition = condition;
    }

    compile2js() {
        if ( this._literal === "not" || this._literal == "!" ) {
            return "!(" + this.condition.compile2js() + ")";
        } else {
            throw new Error("imposible UnaryCondition: " + this.literal);
        }
    }

    compile2json() {
        return [this._literal, this.condition.compile2json()];
    }

    isEmpty() {
        return this.condition.isEmpty();
    }

    hasColumn(column) {
        return this.condition.hasColumn(column);
    }

    each(iterator, context) {
        this.condition.each(iterator, context);
    }
}

module.exports = UnaryCondition;