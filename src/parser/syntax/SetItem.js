"use strict";

/*
    column_name = { expression | DEFAULT }
    ( column_name [, ...] ) = ( { expression | DEFAULT } [, ...] )
    ( column_name [, ...] ) = ( sub-SELECT )
 */

const Syntax = require("./Syntax");

class SetItem extends Syntax {
    parse(coach) {
        if ( coach.is("(") ) {
            coach.expect("(");
            coach.skipSpace();

            this.columns = coach.parseComma("ObjectName");
            this.columns.forEach(name => this.addChild(name));

            coach.skipSpace();
            coach.expect(")");

            coach.skipSpace();
            coach.expect("=");
            coach.skipSpace();

            coach.expect("(");
            coach.skipSpace();

            if ( coach.isSelect() ) {
                this.select = coach.parseSelect();
            } else {
                this.values = coach.parseComma("ValueItem");
                this.values.forEach(valueItem => this.addChild(valueItem));
            }

            coach.skipSpace();
            coach.expect(")");
        } else {
            this.column = coach.parseObjectName();
            this.addChild( this.column );

            coach.skipSpace();
            coach.expect("=");
            coach.skipSpace();

            this.value = coach.parseValueItem();
            this.addChild( this.value );
        }
    }

    is(coach) {
        return coach.is("(") || coach.isObjectName();
    }

    clone() {
        let clone = new SetItem();

        if ( this.columns ) {
            clone.columns = this.columns.map(name => name.clone());
            clone.columns.forEach(name => clone.addChild(name));

            if ( this.select ) {
                clone.select = this.select.clone();
                clone.addChild(clone.select);
            } else {
                clone.values = this.values.map(valueItem => valueItem.clone());
                clone.values.forEach(valueItem => clone.addChild(valueItem));
            }
        } else {
            clone.column = this.column.clone();
            clone.addChild(clone.column);

            clone.value = this.value.clone();
            clone.addChild(clone.value);
        }

        return clone;
    }

    toString() {
        let out = "";

        if ( this.columns ) {
            out += "(";
            out += this.columns.map(name => name.toString()).join(", ");
            out += ")";

            out += " = ";
            out += "(";

            if ( this.select ) {
                out += this.select.toString();
            } else {
                out += this.values.map(valueItem => valueItem.toString()).join(", ");
            }

            out += ")";
        } else {
            out += this.column.toString();
            out += " = ";
            out += this.value.toString();
        }

        return out;
    }
}

module.exports = SetItem;
