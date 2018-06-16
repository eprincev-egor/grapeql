"use strict";

const Syntax = require("./Syntax");

class ValueItem extends Syntax {
    parse(coach) {
        if ( coach.isWord("default") ) {
            coach.expectWord("default");
            this.default = true;
        } else {
            this.expression = coach.parseExpression();
            this.addChild(this.expression);
        }
    }

    is(coach) {
        return coach.isWord("default") || coach.isExpression();
    }

    clone() {
        let clone = new ValueItem();

        if ( this.default ) {
            clone.default = true;
        } else {
            clone.expression = this.expression.clone();
            clone.addChild(clone.expression);
        }

        return clone;
    }

    toString() {
        if ( this.default ) {
            return "default";
        } else {
            return this.expression.toString();
        }
    }
}

module.exports = ValueItem;
