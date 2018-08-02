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

const ChangeCommand = require("./ChangeCommand");

class Insert extends ChangeCommand {
    parse(coach, options) {
        options = options || {allowReturningObject: false};
        if ( coach.isWith() ) {
            this.with = coach.parseWith();
            this.addChild(this.with);
            coach.skipSpace();
        }

        coach.expectWord("insert");
        coach.skipSpace();
        
        if ( options.allowReturningObject ) {
            if ( coach.isWord("row") ) {
                coach.expectWord("row");
                coach.skipSpace();
                
                this.returningObject = true;
            }
        }

        coach.expectWord("into");
        coach.skipSpace();

        this.table = coach.parseTableLink();
        this.addChild(this.table);
        coach.skipSpace();

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
            let length = this.values[0].items.length;
            for (let i = 0, n = this.values.length; i < n; i++) {
                let valuesRow = this.values[ i ];
                
                if ( valuesRow.items.length != length ) {
                    coach.throwError("VALUES lists must all be the same length");
                }
                
                this.addChild(valuesRow);
            }
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

        this.parseReturning(coach);
    }

    is(coach) {
        if ( coach.isWord("insert") ) {
            return true;
        }
        if ( coach.isWith() ) {
            let index = coach.i;
            coach.parseWith();
            coach.skipSpace();

            let isInsert = coach.isWord("insert");
            coach.i = index;

            return isInsert;
        } else {
            return false;
        }
    }

    clone() {
        let clone = new Insert();

        if ( this.with ) {
            clone.with = this.with.clone();
            clone.addChild(clone.with);
        }
        
        if ( this.returningObject ) {
            clone.returningObject = true;
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
            out += "insert row into ";
        } else {
            out += "insert into ";
        }
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

        out += this.toStringReturning();

        return out;
    }
}

module.exports = Insert;
