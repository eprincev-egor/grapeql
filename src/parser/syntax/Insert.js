"use strict";

/*
[ WITH [ RECURSIVE ] with_query [, ...] ]
INSERT INTO table_name [ AS alias ] [ ( column_name [, ...] ) ]
    { DEFAULT VALUES | VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query }
    [ ON CONFLICT [ conflict_target ] conflict_action ]
    [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]

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

class Insert extends Syntax {
    parse(coach) {
        if ( coach.isWith() ) {
            this.with = coach.parseWith();
            this.addChild(this.with);
            coach.skipSpace();
        }

        coach.expectWord("insert");
        coach.skipSpace();

        coach.expectWord("into");
        coach.skipSpace();

        this.table = coach.parseTableLink();
        this.addChild(this.table);
        coach.skipSpace();

        if ( coach.isWord("as") ) {
            coach.expectWord("as");
            coach.skipSpace();

            this.as = coach.parseObjectName();
            this.addChild(this.as);

            coach.skipSpace();
        }

        if ( coach.is("(") ) {
            coach.expect("(");
            coach.skipSpace();

            this.columns = coach.parseComma("ObjectName");
            this.columns.forEach(name => this.addChild(name));

            coach.skipSpace();
            coach.expect(")");

            coach.skipSpace();
        }

        if ( coach.isWord("default") ) {
            coach.expectWord("default");
            coach.skipSpace();

            coach.expectWord("values");
            coach.skipSpace();

            this.defaultValues = true;
        }
        else if ( coach.isWord("values") ) {
            coach.expectWord("values");
            coach.skipSpace();

            this.values = coach.parseComma("ValuesRow");
            this.values.forEach(row => this.addChild(row));
        }
        else {
            this.select = coach.parseSelect();
            this.addChild(this.select);
        }

        coach.skipSpace();
        if ( coach.isOnConflict() ) {
            this.onConflict = coach.parseOnConflict();
            this.addChild(this.onConflict);
        }
        
        coach.skipSpace();
        if ( coach.isWord("returning") ) {
            coach.expectWord("returning");
            coach.skipSpace();
            
            if ( coach.is("*") ) {
                this.returningAll = true;
            } else {
                this.returning = coach.parseComma("Column");
                this.returning.forEach(column => this.addChild(column));
            }
        }
    }

    is(coach) {
        return coach.isWord("insert") || coach.isWith();
    }

    clone() {
        let clone = new Insert();

        if ( this.with ) {
            clone.with = this.with.clone();
            clone.addChild(clone.with);
        }

        clone.table = this.table.clone();
        clone.addChild(clone.table);

        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }

        if ( this.columns ) {
            clone.columns = this.columns.map(name => name.clone());
            clone.columns.forEach(name => clone.addChild(name));
        }

        if ( this.defaultValues ) {
            clone.defaultValues = true;
        }
        else if ( this.values ) {
            clone.values = this.values.map(row => row.clone());
            clone.values.forEach(row => clone.addChild(row));
        }
        else {
            clone.select = this.select.clone();
            clone.addChild(clone.select);
        }

        if ( this.onConflict ) {
            clone.onConflict = this.onConflict.clone();
            clone.addChild(clone.onConflict);
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

        out += "insert into ";
        out += this.table.toString();

        if ( this.as ) {
            out += " as ";
            out += this.as.toString();
        }

        if ( this.columns ) {
            out += "(";
            out += this.columns.map(name => name.toString()).join(", ");
            out += ")";
        }

        if ( this.defaultValues ) {
            out += " default values";
        }
        else if ( this.values ) {
            out += " values ";
            out += this.values.map(row => row.toString()).join(", ");
        }
        else {
            out += " ";
            out += this.select.toString();
        }

        if ( this.onConflict ) {
            out += " ";
            out += this.onConflict.toString();
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

module.exports = Insert;
