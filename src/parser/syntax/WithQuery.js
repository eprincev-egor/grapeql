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

WithQuery.tests = [
    {
        str: "recursive orders as (select * from company)",
        result: {
            recursive: true,
            name: {word: "orders"},
            select: {
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {
                        alias: null
                    }
                }]
            }
        }
    },
    {
        str: "recursive orders (id, \"name\") as (select * from company)",
        result: {
            recursive: true,
            name: {word: "orders"},
            columns: [
                {word: "id"},
                {content: "name"}
            ],
            select: {
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {
                        alias: null
                    }
                }]
            }
        }
    }
];

module.exports = WithQuery;
