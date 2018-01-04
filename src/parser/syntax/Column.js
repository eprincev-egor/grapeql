"use strict";

const Syntax = require("./Syntax");

class Column extends Syntax {
    parse(coach) {
        this.expression = coach.parseExpression({ posibleStar: true });
        this.as = null;
        
        coach.skipSpace();
        if ( coach.isAs() ) {
            this.as = coach.parseAs();
        }
    }
    
    is(coach) {
        if ( coach.isWord() ) {
            let i = coach.i;
            let word = coach.readWord().toLowerCase();
            coach.i = i;
            
            return !this.Coach.Select.keywords.includes(word);
        }
        
        return coach.is("*") || coach.isExpression();
    }
}

Column.tests = [
    {
        str: "company.id as id",
        result: {
            expression: {
                elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]
            },
            as: { alias: {word: "id"} }
        }
    },
    {
        str: "null nulL1",
        result: {
            expression: {
                elements: [
                    {null: true}
                ]
            },
            as: { alias: {word: "null1"} }
        }
    },
    {
        str: "*",
        result: {
            expression: {
                elements: [
                    {link: [
                        "*"
                    ]}
                ]
            }
        }
    }
];

module.exports = Column;
