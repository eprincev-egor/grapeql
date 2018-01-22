"use strict";

const Syntax = require("./Syntax");

class WithQuery extends Syntax {
    parse(coach) {
        // [ RECURSIVE ]
        if ( coach.isWord("recursive") ) {
            coach.expect(/recursive\s+/);
            this.recursive = true;
        }
        
        this.name = coach.parseObjectName().name;
        coach.skipSpace();
        
        // [ ( column_name [, ...] ) ]
        this.columns = null;
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();
            
            this.columns = coach.parseComma("ObjectName");
            this.columns = this.columns.map(objectName => objectName.name);
            
            coach.expect(")");
            coach.skipSpace();
        }
        
        coach.expectWord("as");
        coach.skipSpace();
        
        coach.expect("(");
        coach.skipSpace();
        
        this.select = coach.parseSelect();
        
        coach.expect(")");
    }
    
    is(coach) {
        return !coach.isWord("select") && coach.isObjectName();
    }
}

module.exports = WithQuery;
