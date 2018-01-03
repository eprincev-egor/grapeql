"use strict";

const Syntax = require("./Syntax");

class Cast extends Syntax {
    parse(coach) {
        coach.expectWord("cast");
        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();
        
        this.expression = coach.parseExpression();
        
        coach.skipSpace();
        coach.expectWord("as");
        coach.skipSpace();
        
        this.dataType = coach.parseDataType();
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    is(coach) {
        return coach.isWord("cast");
    }
}

Cast.tests = [
    {
        str: "cast(1 as numeric( 12, 12 ))",
        result: {
            dataType: {
                type: "numeric(12,12)"
            },
            expression: {
                elements: [
                    {
                        number: "1"
                    }
                ]
            }
        }
    },
    {
        str: "cast('nice' as bigint[][])",
        result: {
            dataType: {
                type: "bigint[][]"
            },
            expression: {
                elements: [
                    {
                        content: "nice"
                    }
                ]
            }
        }
    },
    {
        str: "cast( $$nice$$  AS bigint[][])",
        result: {
            dataType: {
                type: "bigint[][]"
            },
            expression: {
                elements: [
                    {
                        content: "nice"
                    }
                ]
            }
        }
    },
    {
        str: "cast( 2 * 3 AS bigint[][])",
        result: {
            dataType: {
                type: "bigint[][]"
            },
            expression: {
                elements: [
                    {
                        number: "2"
                    },
                    {
                        operator: "*"
                    },
                    {
                        number: "3"
                    }
                ]
            }
        }
    }
];

module.exports = Cast;
