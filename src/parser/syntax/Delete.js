"use strict";

/*
[ WITH [ RECURSIVE ] with_query [, ...] ]
DELETE FROM [ ONLY ] table_name [ * ] [ AS alias ]
    [ USING using_list ]
    [ WHERE condition ]
 */

const Syntax = require("./Syntax");

class Delete extends Syntax {
    parse(coach) {
        if ( coach.isWith() ) {
            this.with = coach.parseWith();
            this.addChild(this.with);
            coach.skipSpace();
        }

        coach.expectWord("delete");
        coach.skipSpace();

        coach.expectWord("from");
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

        if ( coach.isWord("using") ) {
            coach.expectWord("using");
            coach.skipSpace();

            this.using = coach.parseComma("FromItem");
            this.using.forEach(fromItem => this.addChild(fromItem));
        }

        if ( coach.isWord("where") ) {
            coach.expectWord("where");
            coach.skipSpace();

            this.where = coach.parseExpression();
            this.addChild(this.where);
        }
    }

    is(coach) {
        return coach.isWord("delete") || coach.isWith();
    }

    clone() {
        let clone = new Delete();

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

        if ( this.using ) {
            clone.using = this.using.map(fromItem => fromItem.clone());
            clone.using.forEach(fromItem => clone.addChild(fromItem));
        }

        if ( this.where ) {
            clone.where = this.where.clone();
            clone.addChild(clone.where);
        }

        return clone;
    }

    toString() {
        let out = "";

        if ( this.with ) {
            out += this.with.toString();
            out += " ";
        }

        out += "delete from ";

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

        if ( this.using ) {
            out += " using ";
            out += this.using.map(fromItem => fromItem.toString()).join(", ");
        }

        if ( this.where ) {
            out += " where ";
            out += this.where.toString();
        }

        return out;
    }
}

module.exports = Delete;
