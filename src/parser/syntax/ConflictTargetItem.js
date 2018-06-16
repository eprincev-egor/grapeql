"use strict";

/*
{ index_column_name | ( index_expression ) } [ COLLATE collation ] [ opclass ]
 */

const Syntax = require("./Syntax");

class ConflictTargetItem extends Syntax {
    parse(coach) {
        if ( coach.is("(") ) {
            coach.expect("(");
            coach.skipSpace();

            this.expression = coach.parseExpression();
            this.addChild(this.expression);

            coach.skipSpace();
            coach.expect(")");
        } else {
            this.column = coach.parseObjectName();
            this.addChild(this.column);
        }
    }

    is(coach) {
        return coach.isExpression();
    }

    clone() {
        let clone = new ConflictTargetItem();

        if ( this.expression ) {
            clone.expression = this.expression.clone();
            clone.addChild(clone.expression);
        } else {
            clone.column = this.column.clone();
            clone.addChild(clone.column);
        }

        return clone;
    }

    toString() {
        if ( this.expression ) {
            return "(" + this.expression.toString() + ")";
        } else {
            return this.column.toString();
        }
    }
}

module.exports = ConflictTargetItem;
