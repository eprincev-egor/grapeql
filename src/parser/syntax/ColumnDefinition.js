"use strict";
/*
column_name data_type [ COLLATE collation ] [ column_constraint [ ... ] ]

where column_constraint is:

{ NOT NULL |
  CHECK ( expression ) [ NO INHERIT ] |
  DEFAULT default_expr |
  UNIQUE index_parameters |
  PRIMARY KEY index_parameters |
  REFERENCES reftable [ ( refcolumn ) ] [ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ]
    [ ON DELETE action ] [ ON UPDATE action ] }
[ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
 */
// TODO: index_parameters
// TODO: collate

const Syntax = require("./Syntax");

class ColumnDefinition extends Syntax {
    parse(coach) {
        this.name = coach.parseObjectName();
        this.addChild(this.name);
        coach.skipSpace();

        this.type = coach.parseDataType();
        coach.skipSpace();


        // not null
        this._parseElement(coach);
        // check
        this._parseElement(coach);
        // default
        this._parseElement(coach);
        // unique
        this._parseElement(coach);
        // primary key
        this._parseElement(coach);
        // references
        this._parseElement(coach);
    }

    _parseElement(coach) {
        if ( !this.notNull && coach.isWord("not") ) {
            coach.expectWord("not");
            coach.skipSpace();

            coach.expectWord("null");
            coach.skipSpace();

            this.notNull = true;
        }

        if ( !this.check && coach.isWord("check") ) {
            coach.expectWord("check");
            coach.skipSpace();

            coach.expect("(");
            coach.skipSpace();

            this.check = coach.parseExpression();
            this.addChild(this.check);

            coach.skipSpace();
            coach.expect(")");

            coach.skipSpace();
        }

        if ( !this.default && coach.isWord("default") ) {
            coach.expectWord("default");
            coach.skipSpace();

            this.default = coach.parseExpression();
            this.addChild(this.default);
        }

        if ( !this.unique && coach.isWord("unique") ) {
            coach.expectWord("unique");
            coach.skipSpace();

            this.unique = this._parseDeferrable(coach);
        }

        if ( !this.primaryKey && coach.isWord("primary") ) {
            coach.expectWord("primary");
            coach.skipSpace();

            coach.expectWord("key");
            coach.skipSpace();

            this.primaryKey = this._parseDeferrable(coach);
        }

        if ( !this.references && coach.isWord("references") ) {
            coach.expectWord("references");
            coach.skipSpace();

            this.references = {};

            this.references.table = coach.parseObjectLink();
            this.addChild(this.references.table);
            coach.skipSpace();

            if ( coach.is("(") ) {
                coach.expect("(");
                coach.skipSpace();

                this.references.column = coach.parseObjectName();
                this.addChild(this.references.column);

                coach.skipSpace();
                coach.expect(")");
                coach.skipSpace();
            }

            if ( coach.isWord("match") ) {
                coach.expectWord("match");
                coach.skipSpace();

                if ( coach.isWord("full") ) {
                    coach.expectWord("full");
                    coach.skipSpace();

                    this.references.match = "full";
                }
                else if ( coach.isWord("simple") ) {
                    coach.expectWord("simple");
                    coach.skipSpace();

                    this.references.match = "simple";
                }
                else {
                    coach.expectWord("partial");
                    coach.skipSpace();

                    this.references.match = "partial";
                }
            }

            this._parseOnAction(coach);
            this._parseOnAction(coach);

            let deferrable = this._parseDeferrable(coach);
            for (let key in deferrable) {
                this.references[ key ] = deferrable[ key ];
            }
        }
    }

    _parseOnAction(coach) {
        if ( !this.references.onDelete && coach.is(/on\s+delete/i) ) {
            coach.expectWord("on");
            coach.skipSpace();

            coach.expectWord("delete");
            coach.skipSpace();

            this.references.onDelete = this._parseAction(coach);
        }

        if ( !this.references.onUpdate && coach.is(/on\s+update/i) ) {
            coach.expectWord("on");
            coach.skipSpace();

            coach.expectWord("update");
            coach.skipSpace();

            this.references.onUpdate = this._parseAction(coach);
        }
    }

    _parseAction(coach) {
        if ( coach.isWord("no") ) {
            coach.expectWord("no");
            coach.skipSpace();

            coach.expectWord("action");
            coach.skipSpace();

            return "no action";
        }
        else if ( coach.isWord("restrict") ) {
            coach.expectWord("restrict");
            coach.skipSpace();

            return "restrict";
        }
        else if ( coach.isWord("cascade") ) {
            coach.expectWord("cascade");
            coach.skipSpace();

            return "cascade";
        }
        else {
            coach.expectWord("set");
            coach.skipSpace();

            if ( coach.isWord("null") ) {
                coach.expectWord("null");
                coach.skipSpace();

                return "set null";
            } else {
                coach.expectWord("default");
                coach.skipSpace();

                return "set default";
            }
        }
    }

    _parseDeferrable(coach) {
        let out = {};
        let index = coach.i;

        // [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
        if ( coach.isWord("deferrable") ) {
            coach.expectWord("deferrable");
            coach.skipSpace();

            out.deferrable = true;
        }
        else if ( coach.isWord("not") ) {
            coach.expectWord("not");
            coach.skipSpace();

            if ( coach.isWord("deferrable") ) {
                coach.expectWord("deferrable");
                coach.skipSpace();

                out.deferrable = false;
            } else {
                coach.i = index;
                return out;
            }
        }

        if ( coach.isWord("initially") ) {
            coach.expectWord("initially");
            coach.skipSpace();

            if ( coach.isWord("deferred") ) {
                coach.expectWord("deferred");
                coach.skipSpace();

                out.initially = "deferred";
            } else {
                coach.expectWord("immediate");
                coach.skipSpace();

                out.initially = "immediate";
            }
        }

        return out;
    }

    is(coach) {
        return coach.isObjectName();
    }

    clone() {
        let clone = new ColumnDefinition();

        clone.name = this.name.clone();
        clone.addChild(this.name);

        clone.type = this.type.clone();
        clone.addChild(this.type);

        if ( this.notNull ) {
            clone.notNull = true;
        }

        if ( this.check ) {
            clone.check = this.check.clone();
            clone.addChild(clone.check);
        }

        if ( this.default ) {
            clone.default = this.default.clone();
            clone.addChild(clone.default);
        }

        if ( this.unique ) {
            clone.unique = this._cloneDeferrable(this.unique);
        }

        if ( this.primaryKey ) {
            clone.primaryKey = this._cloneDeferrable(this.primaryKey);
        }

        if ( this.references ) {
            clone.references = {};

            clone.references.table = this.references.table.clone();
            clone.addChild(clone.references.table);

            if ( this.references.column ) {
                clone.references.column = this.references.column.clone();
                clone.addChild(clone.references.column);
            }

            if ( this.references.match ) {
                clone.references.match = this.references.match;
            }

            if ( this.references.onDelete ) {
                clone.references.onDelete = this.references.onDelete;
            }

            if ( this.references.onUpdate ) {
                clone.references.onUpdate = this.references.onUpdate;
            }

            let deferrable = this._cloneDeferrable(this.references);
            for (let key in deferrable) {
                clone.references[ key ] = deferrable[ key ];
            }
        }

        return clone;
    }

    _cloneDeferrable(obj) {
        let out = {};

        if ( obj.deferrable === true ) {
            out.deferrable = true;
        }
        else if ( obj.deferrable === false ) {
            out.deferrable = false;
        }

        if ( obj.initially ) {
            out.initially = obj.initially;
        }

        return out;
    }

    toString() {
        let out = "";

        out += this.name.toString();
        out += " ";
        out += this.type.toString();

        if ( this.notNull ) {
            out += " not null";
        }

        if ( this.check ) {
            out += " check( ";
            out += this.check.toString();
            out += " )";
        }

        if ( this.default ) {
            out += " default ";
            out += this.default.toString();
        }

        if ( this.unique ) {
            out += " unique";
            out += this._deferrableToString(this.unique);
        }

        if ( this.primaryKey ) {
            out += " primary key";
            out += this._deferrableToString(this.primaryKey);
        }

        if ( this.references ) {
            out += " references ";
            out += this.references.table.toString();

            if ( this.references.column ) {
                out += " (";
                out += this.references.column.toString();
                out += ")";
            }

            if ( this.references.match ) {
                out += " match " + this.references.match;
            }

            if ( this.references.onDelete ) {
                out += " on delete ";
                out += this.references.onDelete;
            }

            if ( this.references.onUpdate ) {
                out += " on update ";
                out += this.references.onUpdate;
            }

            out += this._deferrableToString(this.references);
        }

        return out;
    }

    _deferrableToString(obj) {
        let out = "";

        if ( obj.deferrable === true ) {
            out += " deferrable";
        }
        else if ( obj.deferrable === false ) {
            out += " not deferrable";
        }

        if ( obj.initially ) {
            out += " initially " + obj.initially;
        }

        return out;
    }
}

module.exports = ColumnDefinition;
