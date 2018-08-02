"use strict";

/*
[ WITH [ RECURSIVE ] with_query [, ...] ]
DELETE FROM [ ONLY ] table_name [ * ] [ AS alias ]
    [ USING using_list ]
    [ WHERE condition ]
    [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]
 */

const ChangeCommand = require("./ChangeCommand");

class Delete extends ChangeCommand {
    constructor(fromString) {
        super();
        // need for ChangesCatcher
        this.commandType = "delete";
        this.fromString(fromString);
    }

    parse(coach, options) {
        options = options || {allowReturningObject: false};

        if ( coach.isWith() ) {
            this.with = coach.parseWith();
            this.addChild(this.with);
            coach.skipSpace();
        }

        coach.expectWord("delete");
        coach.skipSpace();

        if ( options.allowReturningObject ) {
            if ( coach.isWord("row") ) {
                coach.expectWord("row");
                coach.skipSpace();
                 
                this.returningObject = true;
            }
        }

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

            let i = coach.i;
            this.as = coach.parseObjectName();
            this.addChild(this.as);

            coach.skipSpace();

            if ( this.as.toLowerCase()[0] == "$" ) {
                coach.i = i;
                coach.throwError("$ is reserved symbol for alias");
            }
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

        this.parseReturning(coach);
    }

    is(coach) {
        if ( coach.isWord("delete") ) {
            return true;
        }
        if ( coach.isWith() ) {
            let index = coach.i;
            coach.parseWith();
            coach.skipSpace();

            let isInsert = coach.isWord("delete");
            coach.i = index;

            return isInsert;
        } else {
            return false;
        }
    }

    clone() {
        let clone = new Delete();

        if ( this.with ) {
            clone.with = this.with.clone();
            clone.addChild(clone.with);
        }

        if ( this.returningObject ) {
            clone.returningObject = true;
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

        this.cloneReturning(clone);

        return clone;
    }

    toString(options) {
        options = options || {pg: false};
        let out = "";

        if ( this.with ) {
            out += this.with.toString();
            out += " ";
        }

        if ( !options.pg && this.returningObject ) {
            out += "delete row from ";
        } else {
            out += "delete from ";
        }

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

        out += this.toStringReturning();

        return out;
    }
}

module.exports = Delete;
