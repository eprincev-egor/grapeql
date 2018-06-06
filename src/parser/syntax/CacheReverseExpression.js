"use strict";

const Syntax = require("./Syntax");

/*
after change orders set where
    company.id = orders.id_client
 */

class CacheReverseExpression extends Syntax {
    parse(coach) {
        coach.expectWord("after");
        coach.skipSpace();

        coach.expectWord("change");
        coach.skipSpace();

        this.table = coach.parseTableLink();
        this.addChild(this.table);
        coach.skipSpace();

        if ( coach.isWord("as") ) {
            coach.expectWord("as");
            coach.skipSpace();

            this.as = coach.parseObjectName();
            coach.skipSpace();
        }

        coach.expectWord("set");
        coach.skipSpace();

        coach.expectWord("where");
        coach.skipSpace();

        this.expression = coach.parseExpression();
        this.addChild(this.expression);
    }

    is(coach) {
        return coach.isWord("after");
    }

    clone() {
        let clone = new CacheReverseExpression();

        clone.table = this.table.clone();
        clone.addChild(clone.table);

        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }

        clone.expression = this.expression.clone();
        clone.addChild(clone.expression);

        return clone;
    }

    toString() {
        let out = "";

        out += "after change ";
        out += this.table.toString();

        if ( this.as ) {
            out += " as ";
            out += this.as.toString();
        }

        out += " set where ";
        out += this.expression.toString();

        return out;
    }
}

module.exports = CacheReverseExpression;
