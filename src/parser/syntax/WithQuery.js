"use strict";

const Syntax = require("./Syntax");

class WithQuery extends Syntax {
    parse(coach) {
        this.name = coach.parseObjectName();
        this.addChild(this.name);
        coach.skipSpace();

        // [ ( column_name [, ...] ) ]
        this.columns = null;
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();

            this.columns = coach.parseComma("ObjectName");
            this.columns.map(objectName => this.addChild(objectName));

            coach.expect(")");
            coach.skipSpace();
        }

        coach.expectWord("as");
        coach.skipSpace();

        coach.expect("(");
        coach.skipSpace();

        this.select = coach.parseSelect();
        this.addChild(this.select);

        coach.expect(")");
    }

    is(coach) {
        return !coach.isWord("select") && coach.isObjectName();
    }

    clone() {
        let clone = new WithQuery();

        clone.name = this.name.clone();
        clone.addChild(clone.name);

        clone.columns = null;
        if ( this.columns ) {
            clone.columns = this.columns.map(column => column.clone());
            clone.columns.map(column => clone.addChild(column));
        }

        clone.select = this.select.clone();
        clone.addChild(clone.select);

        return clone;
    }

    toString() {
        let out = "";

        out += this.name.toString() + " ";

        if ( this.columns ) {
            out += "(";
            out += this.columns.map(column => column.toString()).join(", ");
            out += ") ";
        }

        out += "as (";
        out += this.select.toString();
        out += ")";

        return out;
    }
}

module.exports = WithQuery;
