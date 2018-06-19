"use strict";

const Syntax = require("./Syntax");

class Update extends Syntax {
    parse(coach) {
        if ( coach.isWith() ) {
            this.with = coach.parseWith();
            this.addChild(this.with);
            coach.skipSpace();
        }

        coach.expectWord("update");
        coach.skipSpace();

        if ( coach.isWord("only") ) {
            coach.expectWord("only");
            coach.skipSpace();

            this.only = true;
        }

        this.table = coach.parseTableLink();
        this.addChild(this.table);
        coach.skipSpace();

        if ( coach.is("*") ) {
            coach.i++;
            coach.skipSpace();

            this.star = true;
        }

        if ( coach.isWord("as") ) {
            coach.expectWord("as");
            coach.skipSpace();

            this.as = coach.parseObjectName();
            this.addChild(this.as);

            coach.skipSpace();
        }

        coach.expectWord("set");
        coach.skipSpace();

        this.set = coach.parseComma("SetItem");
        this.set.forEach(setItem => this.addChild(setItem));
        coach.skipSpace();

        if ( coach.isWord("from") ) {
            coach.expectWord("from");
            coach.skipSpace();

            this.from = coach.parseComma("FromItem");
            this.from.forEach(fromItem => this.addChild(fromItem));
            coach.skipSpace();
        }

        if ( coach.isWord("where") ) {
            coach.expectWord("where");
            coach.skipSpace();

            this.where = coach.parseExpression();
            this.addChild(this.where);
        }

        coach.skipSpace();
        if ( coach.isWord("returning") ) {
            coach.expectWord("returning");
            coach.skipSpace();

            if ( coach.is("*") ) {
                coach.expect("*");
                this.returningAll = true;
            } else {
                this.returning = coach.parseComma("Column");
                this.returning.forEach(column => this.addChild(column));
            }
        }
    }

    is(coach) {
        if ( coach.isWord("update") ) {
            return true;
        }
        if ( coach.isWith() ) {
            let index = coach.i;
            coach.parseWith();
            coach.skipSpace();

            let isInsert = coach.isWord("update");
            coach.i = index;

            return isInsert;
        } else {
            return false;
        }
    }

    clone() {
        let clone = new Update();

        if ( this.with ) {
            clone.with = this.with.clone();
            clone.addChild(clone.with);
        }

        if ( this.only ) {
            clone.only = true;
        }

        clone.table = this.table.clone();
        clone.addChild(clone.table);

        if ( this.star ) {
            clone.star = true;
        }

        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }

        clone.set = this.set.map(setItem => setItem.clone());
        clone.set.forEach(setItem => clone.addChild(setItem));

        if ( this.from ) {
            clone.from = this.from.map(fromItem => fromItem.clone());
            clone.from.forEach(fromItem => clone.addChild(fromItem));
        }

        if ( this.where ) {
            clone.where = this.where.clone();
            clone.addChild(clone.where);
        }

        if ( this.returningAll ) {
            clone.returningAll = true;
        }
        else if ( this.returning ) {
            clone.returning = this.returning.map(column => column.clone());
            clone.returning.forEach(column => clone.addChild(column));
        }

        return clone;
    }

    toString() {
        let out = "";

        if ( this.with ) {
            out += this.with.toString();
            out += " ";
        }

        out += "update ";

        if ( this.only ) {
            out += "only ";
        }

        out += this.table.toString();

        if ( this.star ) {
            out += " *";
        }

        if ( this.as ) {
            out += " as ";
            out += this.as.toString();
        }

        out += " set ";
        out += this.set.map(setItem => setItem.toString()).join(", ");

        if ( this.from ) {
            out += " from ";
            out += this.from.map(fromItem => fromItem.toString()).join(", ");
        }

        if ( this.where ) {
            out += " where ";
            out += this.where.toString();
        }

        if ( this.returningAll ) {
            out += " returning *";
        }
        else if ( this.returning ) {
            out += " returning ";
            out += this.returning.map(column => column.toString()).join(", ");
        }

        return out;
    }
}

module.exports = Update;
