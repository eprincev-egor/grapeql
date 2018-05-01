"use strict";

const ObjectName = require("./ObjectName");

class As extends ObjectName {
    parse(coach) {
        let needAlias = false;

        if ( coach.isWord("as") ) {
            coach.expect("as");
            coach.skipSpace();
            needAlias = true;
            this.hasWordAs = true;
        }

        let index = coach.i;
        try {
            super.parse(coach);
        } catch(err) {
            coach.i = index;
            coach.throwError("expected alias");
        }

        if ( this.word ) {
            let word = this.word;
            if ( this.Coach.Select.keywords.includes( word.toLowerCase() ) ) {
                coach.i = index;

                if ( needAlias ) {
                    // in fact, there may be keywords, except for some.
                    // for example select id as group from company
                    // will be valid, but it is recommended that you use double quotes
                    coach.throwError("unexpected keyword: " + word);
                }
            }
        }
    }

    is(coach) {
        if ( coach.isDoubleQuotes() ) {
            return true;
        }

        if ( coach.isWord() ) {
            let i = coach.i;
            let word = coach.readWord().toLowerCase();
            coach.i = i;

            return word == "as" || !this.Coach.Select.keywords.includes(word);
        }

        return false;
    }

    clone() {
        let clone = new As();
        this.fillClone( clone );
        return clone;
    }

    fillClone(clone) {
        clone.hasWordAs = this.hasWordAs;
        super.fillClone(clone);
    }

    toString() {
        let out = super.toString();

        if ( this.hasWordAs ) {
            out = "as " + out;
        }

        return out;
    }
}

module.exports = As;
