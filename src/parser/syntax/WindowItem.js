"use strict";

const Syntax = require("./Syntax");

class WindowItem extends Syntax {
    parse(coach) {
        this.as = coach.parseObjectName();
        this.addChild(this.as);
        coach.skipSpace();

        coach.expectWord("as");
        coach.skipSpace();

        coach.expect("(");
        coach.skipSpace();

        this.body = coach.parseWindowDefinition();
        this.addChild(this.body);

        coach.skipSpace();
        coach.expect(")");
    }

    is(coach) {
        if ( !coach.isObjectName() ) {
            return false;
        }

        let i = coach.i;

        coach.parseObjectName();
        coach.skipSpace();

        let isWindowItem = coach.is(/as\s*\(/i);

        coach.i = i;
        return isWindowItem;
    }

    clone() {
        let clone = new WindowItem();

        clone.as = this.as.clone();
        clone.addChild(clone.as);

        clone.body = this.body.clone();
        clone.addChild(clone.body);

        return clone;
    }

    toString() {
        return `${this.as} as (${ this.body })`;
    }
}

module.exports = WindowItem;
