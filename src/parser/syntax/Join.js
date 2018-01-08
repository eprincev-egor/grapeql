"use strict";

/*
 join_type from_item [ ON join_condition | USING ( join_column [, ...] ) ]

where 
    join_type One of
        [ INNER ] JOIN
        LEFT [ OUTER ] JOIN
        RIGHT [ OUTER ] JOIN
        FULL [ OUTER ] JOIN
        CROSS JOIN

 */
 
const Syntax = require("./Syntax");
const tests = require("./Join.tests");

class Join extends Syntax {
    parse(coach) {
        let type = coach.expect(/(((left|right|full)\s+(outer\s+)?)|(inner\s+)?|cross\s+)join\s+/i, "expected join keyword");
        type = type.toLowerCase()
            // normolize spaces
            .replace(/\s+/g, " ")
            .trim();
        
        // coach.skipSpace();
        this.type = type;
        
        this.from = coach.parseFromItem();
        coach.skipSpace();
        
        if ( coach.isWord("on") ) {
            coach.expectWord("on");
            coach.skipSpace();
            
            this.on = coach.parseExpression();
        }
        else if ( coach.isWord("using") ) {
            coach.expectWord("using");
            coach.skipSpace();
            
            this.using = coach.parseComma("ObjectLink");
        }
        else {
            coach.throwError("expected 'on' or 'using'");
        }
    }
    
    is(coach) {
        return coach.is(/(left|right|inner|join|full|cross)\s/i);
    }
}

Join.tests = tests;

module.exports = Join;