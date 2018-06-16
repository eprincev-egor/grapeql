"use strict";
/*
  ON CONFLICT [ conflict_target ] conflict_action

  where conflict_target can be one of:

    ( { index_column_name | ( index_expression ) } [ COLLATE collation ] [ opclass ] [, ...] ) [ WHERE index_predicate ]
    ON CONSTRAINT constraint_name

and conflict_action is one of:

    DO NOTHING
    DO UPDATE SET { column_name = { expression | DEFAULT } |
                    ( column_name [, ...] ) = ( { expression | DEFAULT } [, ...] ) |
                    ( column_name [, ...] ) = ( sub-SELECT )
                  } [, ...]
              [ WHERE condition ]
 */
const Syntax = require("./Syntax");

class OnConflict extends Syntax {
    parse(coach) {
        coach.expectWord("on");
        coach.skipSpace();

        coach.expectWord("conflict");
        coach.skipSpace();

        // conflict_target
        if ( coach.is("(") ) {
            coach.expect("(");
            coach.skipSpace();

            this.target = coach.parseComma("ConflictTargetItem");
            this.target.forEach(item => this.addChild(item));

            coach.skipSpace();
            coach.expect(")");
        }
        else if ( coach.isWord("on") ) {
            coach.expectWord("on");
            coach.skipSpace();

            coach.expectWord("constraint");
            coach.skipSpace();

            this.constraint = coach.parseObjectName();
            this.addChild(this.constraint);
        }
        coach.skipSpace();

        if ( coach.isWord("where") ) {
            coach.expectWord("where");
            coach.skipSpace();

            this.where = coach.parseExpression();
            this.addChild(this.where);
        }

        // conflict_action
        coach.expectWord("do");
        coach.skipSpace();

        if ( coach.isWord("nothing") ) {
            coach.expectWord("nothing");
            this.doNothing = true;
        } else {
            coach.expectWord("update");
            coach.skipSpace();

            coach.expectWord("set");
            coach.skipSpace();

            this.updateSet = coach.parseComma("SetItem");
            this.updateSet.forEach(setItem => this.addChild(setItem));
            coach.skipSpace();

            if ( coach.isWord("where") ) {
                coach.expectWord("where");
                coach.skipSpace();

                this.updateWhere = coach.parseExpression();
                this.addChild(this.updateWhere);
            }
        }
    }

    is(coach) {
        return coach.isWord("on");
    }

    clone() {
        let clone = new OnConflict();

        if ( this.target ) {
            clone.target = this.target.map(item => item.clone());
            clone.target.forEach(item => clone.addChild(item));
        }
        else if ( this.constraint ) {
            clone.constraint = this.constraint.clone();
            clone.addChild(clone.constraint);
        }

        if ( this.where ) {
            clone.where = this.where.clone();
            clone.addChild(clone.where);
        }

        if ( this.doNothing ) {
            clone.doNothing = true;
        } else {
            clone.updateSet = this.updateSet.map(setItem => setItem.clone());
            clone.updateSet.forEach(setItem => this.addChild(setItem));

            if ( this.updateWhere ) {
                clone.updateWhere = this.updateWhere.clone();
                clone.addChild(clone.updateWhere);
            }
        }

        return clone;
    }

    toString() {
        let out = "on conflict ";

        if ( this.target ) {
            out += "(";
            out += this.target.map(item => item.toString()).join(", ");
            out += ")";
        }
        else if ( this.constraint ) {
            out += "on constraint ";
            out += this.constraint.toString();
        }

        if ( this.where ) {
            out += " where ";
            out += this.where.toString();
        }

        if ( this.doNothing ) {
            out += "do nothing";
        } else {
            out += "do update set ";
            out += this.updateSet.map(setItem => setItem.toString()).join(", ");

            if ( this.updateWhere ) {
                out += " where ";
                out += this.updateWhere.toString();
            }
        }

        return out;
    }
}

module.exports = OnConflict;
