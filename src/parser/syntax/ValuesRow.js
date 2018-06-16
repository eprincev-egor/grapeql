"use strict";

const Syntax = require("./Syntax");

class ValuesRow extends Syntax {
    parse(coach) {
        coach.expect("(");
        coach.skipSpace();

        this.items = coach.parseComma("ValueItem");
        this.items.forEach(valueItem => this.addChild(valueItem));

        coach.skipSpace();
        coach.expect(")");
    }

    is(coach) {
        return coach.is("(");
    }

    clone() {
        let clone = new ValuesRow();

        clone.items = this.items.map(valueItem => valueItem.clone());
        clone.items.forEach(valueItem => clone.addChild(valueItem));

        return clone;
    }

    toString() {
        let out = "(";

        out += this.items.map(valueItem => valueItem.toString()).join(", ");

        out += ")";
        return out;
    }
}

module.exports = ValuesRow;
