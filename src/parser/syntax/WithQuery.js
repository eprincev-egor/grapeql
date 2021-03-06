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

            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
        }

        coach.expectWord("as");
        coach.skipSpace();

        coach.expect("(");
        coach.skipSpace();

        if ( coach.isWord("values") ) {
            coach.expectWord("values");
            coach.skipSpace();

            this.values = coach.parseComma("ValuesRow");
            let length = this.values[0].items.length;
            for (let i = 0, n = this.values.length; i < n; i++) {
                let valuesRow = this.values[ i ];
                
                if ( valuesRow.items.length != length ) {
                    coach.throwError("VALUES lists must all be the same length");
                }
                
                valuesRow.walk(item => {
                    if ( item.default ) {
                        coach.throwError("DEFAULT is not allowed in this context");
                    }
                });
                
                this.addChild(valuesRow);
            }
        }
        else if ( coach.isInsert() ) {
            this.insert = coach.parseInsert();
            this.addChild(this.insert);
        }
        else if ( coach.isUpdate() ) {
            this.update = coach.parseUpdate();
            this.addChild(this.update);
        }
        else if ( coach.isDelete() ) {
            this.delete = coach.parseDelete();
            this.addChild(this.delete);
        }
        else {
            this.select = coach.parseSelect();
            this.addChild(this.select);
        }

        coach.skipSpace();
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

        if ( this.values ) {
            clone.values = this.values.map(valueRow => valueRow.clone());
            clone.values.forEach(valueRow => clone.addChild(valueRow));
        }
        else if ( this.insert ) {
            clone.insert = this.insert.clone();
            clone.addChild(clone.insert);
        }
        else if ( this.update ) {
            clone.update = this.update.clone();
            clone.addChild(clone.update);
        }
        else if ( this.delete ) {
            clone.delete = this.delete.clone();
            clone.addChild(clone.delete);
        }
        else {
            clone.select = this.select.clone();
            clone.addChild(clone.select);
        }

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
        if ( this.values ) {
            out += " values " + this.values.map(valueRow => valueRow.toString()).join(", ");
        }
        else if ( this.insert ) {
            out += this.insert.toString();
        }
        else if ( this.update ) {
            out += this.update.toString();
        }
        else if ( this.delete ) {
            out += this.delete.toString();
        }
        else {
            out += this.select.toString();
        }

        out += ")";

        return out;
    }

    removeValuesColumn(columnNameToRemove) {
        let index = this.columns.findIndex(columnName =>
            columnName.equal( columnNameToRemove )
        );

        if ( index == -1 ) {
            return;
        }

        this.columns.splice( index, 1 );
        this.values.forEach(valueRow => {
            valueRow.items.splice(index, 1);
        });
    }
}

module.exports = WithQuery;
