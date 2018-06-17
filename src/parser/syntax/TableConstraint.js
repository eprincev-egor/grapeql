"use strict";

/*
[ CONSTRAINT constraint_name ]
{ CHECK ( expression ) [ NO INHERIT ] |
  UNIQUE ( column_name [, ... ] ) index_parameters |
  PRIMARY KEY ( column_name [, ... ] ) index_parameters |
  EXCLUDE [ USING index_method ] ( exclude_element WITH operator [, ... ] ) index_parameters [ WHERE ( predicate ) ] |
  FOREIGN KEY ( column_name [, ... ] ) REFERENCES reftable [ ( refcolumn [, ... ] ) ]
    [ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ] [ ON DELETE action ] [ ON UPDATE action ] }
[ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]

 */
// TODO: index_parameters
// TODO: exclude
const Syntax = require("./Syntax");

class TableConstraint extends Syntax {
    parse(coach) {
        if ( coach.isWord("constraint") ) {
            coach.expectWord("constraint");
            coach.skipSpace();
            
            this.name = coach.parseObjectName();
            this.addChild(this.name);
            coach.skipSpace();
        }
        
        this.parseConstraintBody(coach);
    }
    
    parseConstraintBody(coach) {
        if ( coach.isWord("check") ) {
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
    
        else if ( coach.isWord("unique") ) {
            coach.expectWord("unique");
            coach.skipSpace();
            
            this.unique = {};
            
            coach.expect("(");
            coach.skipSpace();
            
            this.unique.columns = coach.parseComma("ObjectName");
            this.unique.columns.forEach(name => this.addChild(name));
            
            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
        }
    
        else if ( coach.isWord("primary") ) {
            coach.expectWord("primary");
            coach.skipSpace();
            
            coach.expectWord("key");
            coach.skipSpace();
            
            this.primaryKey = {};
            
            coach.expect("(");
            coach.skipSpace();
    
            this.primaryKey.columns = coach.parseComma("ObjectName");
            this.primaryKey.columns.forEach(name => this.addChild(name));
            
            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
        }
    
        else if ( coach.isWord("foreign") ) {
            coach.expectWord("foreign");
            coach.skipSpace();
            
            coach.expectWord("key");
            coach.skipSpace();
            
            this.foreignKey = {};
            
            coach.expect("(");
            coach.skipSpace();
    
            this.foreignKey.columns = coach.parseComma("ObjectName");
            this.foreignKey.columns.forEach(name => this.addChild(name));
            
            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
            
            this.foreignKey.references = this.parseReferences(coach);
        }
        
        if ( !this.check ) {
            this.parseDeferrable(coach);
        }
    }
    
    parseReferences(coach) {
        coach.expectWord("references");
        coach.skipSpace();
        
        let references = {};
        
        references.table = coach.parseObjectLink();
        this.addChild(references.table);
        coach.skipSpace();

        if ( coach.is("(") ) {
            coach.expect("(");
            coach.skipSpace();

            references.columns = coach.parseComma("ObjectName");
            references.columns.forEach(name => this.addChild(name));
            
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

                references.match = "full";
            }
            else if ( coach.isWord("simple") ) {
                coach.expectWord("simple");
                coach.skipSpace();

                references.match = "simple";
            }
            else {
                coach.expectWord("partial");
                coach.skipSpace();

                references.match = "partial";
            }
        }

        this._parseOnAction(references, coach);
        this._parseOnAction(references, coach);
        
        return references;
    }
    
    _parseOnAction(references, coach) {
        if ( !references.onDelete && coach.is(/on\s+delete/i) ) {
            coach.expectWord("on");
            coach.skipSpace();
    
            coach.expectWord("delete");
            coach.skipSpace();
    
            references.onDelete = this._parseAction(coach);
        }
    
        if ( !references.onUpdate && coach.is(/on\s+update/i) ) {
            coach.expectWord("on");
            coach.skipSpace();
    
            coach.expectWord("update");
            coach.skipSpace();
    
            references.onUpdate = this._parseAction(coach);
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
    
    parseDeferrable(coach) {
        let index = coach.i;
    
        // [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
        if ( coach.isWord("deferrable") ) {
            coach.expectWord("deferrable");
            coach.skipSpace();
    
            this.deferrable = true;
        }
        else if ( coach.isWord("not") ) {
            coach.expectWord("not");
            coach.skipSpace();
    
            if ( coach.isWord("deferrable") ) {
                coach.expectWord("deferrable");
                coach.skipSpace();
    
                this.deferrable = false;
            } else {
                coach.i = index;
                return;
            }
        }
    
        if ( coach.isWord("initially") ) {
            coach.expectWord("initially");
            coach.skipSpace();
    
            if ( coach.isWord("deferred") ) {
                coach.expectWord("deferred");
                coach.skipSpace();
    
                this.initially = "deferred";
            } else {
                coach.expectWord("immediate");
                coach.skipSpace();
    
                this.initially = "immediate";
            }
        }
    }

    
    is(coach) {
        return (
            coach.isWord("constraint") ||
            coach.isWord("check") ||
            coach.isWord("unique") ||
            coach.isWord("primary") ||
            coach.isWord("exclude") ||
            coach.isWord("foreign")
        );
    }
    
    clone() {
        let clone = new TableConstraint();
        
        if ( this.name ) {
            clone.name = this.name.clone();
            clone.addChild(clone.name);
        }
        
        if ( this.check ) {
            clone.check = this.check.clone();
            clone.addChild(clone.check);
        }
        else if ( this.unique ) {
            clone.unique = {};
            
            clone.unique.columns = this.unique.columns.map(name => name.clone());
            clone.unique.columns.forEach(name => clone.addChild(name));
        }
        else if ( this.primaryKey ) {
            clone.primaryKey = {};
            
            clone.primaryKey.columns = this.primaryKey.columns.map(name => name.clone());
            clone.primaryKey.columns.forEach(name => clone.addChild(name));
        }
        else if ( this.foreignKey ) {
            clone.foreignKey = {};
            
            clone.foreignKey.columns = this.foreignKey.columns.map(name => name.clone());
            clone.foreignKey.columns.forEach(name => clone.addChild(name));
            
            this._cloneReferences(clone);
        }
        
        if ( this.deferrable === true ) {
            clone.deferrable = true;
        }
        else if ( this.deferrable === false ) {
            clone.deferrable = false;
        }
        
        if ( this.initially ) {
            clone.initially = this.initially;
        }
        
        return clone;
    }
    
    _cloneReferences(clone) {
        let origReferences = this.foreignKey.references;
        let references = {};
        
        references.table = origReferences.table.clone();
        clone.addChild(references.table);
        
        if ( origReferences.columns ) {
            references.columns = origReferences.columns.map(name => name.clone());
            references.columns.forEach(name => clone.addChild(name));
        }
        
        if ( origReferences.match ) {
            references.match = origReferences.match;
        }
        
        if ( origReferences.onDelete ) {
            references.onDelete = origReferences.onDelete;
        }
        
        if ( origReferences.onUpdate ) {
            references.onUpdate = origReferences.onUpdate;
        }
        
        clone.foreignKey.references = references;
    }
    
    toString() {
        let out = "";
        
        if ( this.name ) {
            out += "constraint ";
            out += this.name.toString();
            out += " ";
        }
        
        
        if ( this.check ) {
            out += "check( ";
            out += this.check.toString();
            out += ")";
        }
        else if ( this.unique ) {
            out += "unique (";
            out += this.unique.columns.map(name => name.toString()).join(", ");
            out += ")";
        }
        else if ( this.primaryKey ) {
            out += "primary key (";
            out += this.primaryKey.columns.map(name => name.toString()).join(", ");
            out += ")";
        }
        else if ( this.foreignKey ) {
            out += "foreign key (";
            out += this.foreignKey.columns.map(name => name.toString()).join(", ");
            out += ") ";
            
            out += this.referencesToString(this.foreignKey.references);
        }

        
        if ( this.deferrable === true ) {
            out += " deferrable";
        }
        else if ( this.deferrable === false ) {
            out += " not deferrable";
        }

        if ( this.initially ) {
            out += " initially " + this.initially;
        }
        
        return out;
    }
    
    referencesToString(references)  {
        let out = "references ";
        out += references.table.toString();

        if ( references.columns ) {
            out += " (";
            out += references.columns.map(name => name.toString()).join(", ");
            out += ")";
        }

        if ( references.match ) {
            out += " match " + references.match;
        }

        if ( references.onDelete ) {
            out += " on delete ";
            out += references.onDelete;
        }

        if ( references.onUpdate ) {
            out += " on update ";
            out += references.onUpdate;
        }
        
        return out;
    }
}

module.exports = TableConstraint;
