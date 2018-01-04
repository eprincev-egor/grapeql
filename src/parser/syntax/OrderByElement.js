"use strict";

const Syntax = require("./Syntax");

class OrderByElement extends Syntax {
    parse(coach) {
        this.expression = coach.parseExpression();
        coach.skipSpace();
        
        if ( coach.is(/asc|desc/i) ) {
            this.vector = coach.readWord().toLowerCase();
            coach.skipSpace();
        } 
        else if ( coach.is(/using\s/) ) {
            coach.readWord(); // using
            coach.skipSpace();
            
            this.using = coach.parseOperator();
        }
        
        if ( coach.is(/nulls\s+(first|last)/i) ) {
            coach.skipSpace();
            coach.readWord(); // nulls
            coach.skipSpace();
            
            this.nulls = coach.readWord().toLowerCase();
        }
    }
    
    is(coach) {
        return coach.isExpression();
    }
}

OrderByElement.tests = [
    {
        str: "id Desc",
        result: {
            expression: {elements: [
                {link: [
                    {word: "id"}
                ]}
            ]},
            vector: "desc"
        }
    }
];

module.exports = OrderByElement;
