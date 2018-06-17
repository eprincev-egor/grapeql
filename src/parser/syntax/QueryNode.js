"use strict";

const Syntax = require("./Syntax");

class QueryNode extends Syntax {
    parse(coach) {
        if ( coach.isDeclare() ) {
            this.declare = coach.parseDeclare();
            this.addChild(this.declare);
            coach.skipSpace();
        }

        this.select = coach.parseSelect();
        this.addChild(this.select);
    }

    is(coach) {
        return coach.isDeclare() || coach.isSelect();
    }

    clone() {
        let clone = new QueryNode();

        if ( this.declare ) {
            clone.declare = this.declare.clone();
            clone.addChild(clone.declare);
        }

        clone.select = this.select.clone();
        clone.addChild(clone.select);

        return clone;
    }

    toString() {
        let out = "";

        if ( this.declare ) {
            out += this.declare.toString();
            out += " ";
        }

        out += this.select.toString();

        return out;
    }
}

module.exports = QueryNode;
