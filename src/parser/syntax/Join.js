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

class Join extends Syntax {
    parse(coach) {
        let lateralErrorIndex = coach.i;
        
        let type = coach.expect(/(((left|right|full)\s+(outer\s+)?)|(inner\s+)?|cross\s+)join\s+/i, "expected join keyword");
        type = type.toLowerCase()
            // normolize spaces
            .replace(/\s+/g, " ")
            .trim();
        
        // coach.skipSpace();
        this.type = type;
        
        this.from = coach.parseFromItem();
        coach.skipSpace();
        
        if ( this.from.lateral ) {
            if ( type != "join" && type != "left join" && type != "inner join" )  {
                coach.i = lateralErrorIndex;
                coach.throwError("The combining JOIN type must be INNER or LEFT for a LATERAL reference.");
            }
        }
        
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
    
    toString() {
        let out = this.type;
        
        out += " ";
        out += this.from.toString();
        
        if ( this.on ) {
            out += " on " + this.on.toString();
        } else {
            out += " using " + this.using.map(elem => elem.toString()).join(", ");
        }
        
        return out;
    }
}

module.exports = Join;
