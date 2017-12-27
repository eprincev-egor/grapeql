"use strict";

const Syntax = require("../syntax/Syntax");

class Expression extends Syntax {
    constructor() {
        super();
        this.elements = [];
    }
    
    parse(coach) {
        this.parseElements( coach );
        this.elements = this.extrude(this.elements);
    }
    
    parseElements(coach) {
        let operator;
        
        if ( coach.isOperator() ) {
            operator = coach.parseOperator();
            this.elements.push( operator );
            coach.skipSpace();
        }
        
        let elem = this.parseElement( coach );
        this.elements.push(elem);
        
        // ::text::text::text
        coach.skipSpace();
        this.parseToTypes(coach);
        
        // operator
        coach.skipSpace();
        if ( coach.isOperator() ) {
            this.parseElements(coach);
        }
    }
    
    parseElement(coach) {
        let elem;
        
        // sub expression
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();
            
            elem = coach.parseExpression();
            
            coach.skipSpace();
            coach.expect(")");
        }
        
        else if ( coach.isCast() ) {
            elem = coach.parseCast();
        }
        
        else if ( coach.isPgNull() ) {
            elem = coach.parsePgNull();
        }
        
        else if ( coach.isBoolean() ) {
            elem = coach.parseBoolean();
        }
        
        else if ( coach.isPgNumber() ) {
            elem = coach.parsePgNumber();
        }
        
        // string
        else if ( coach.isPgString() ) {
            elem = coach.parsePgString();
        }
        
        // case when then else end
        // else if ( coach.isCaseWhen() ) {
        //     elem = coach.parseCaseWhen();
        // }
        
        else if ( coach.isSystemVariable() ) {
            elem = coach.parseSystemVariable();
        }
        
        return elem;
    }
    
    parseToTypes(coach) {
        if ( coach.isToType() ) {
            let elem = coach.parseToType();
            this.elements.push( elem );
            
            coach.skipSpace();
            this.parseToTypes(coach);
        }
    }
    
    // ((( expression )))  достаем выражение из лишних скобок
    extrude(elements) {
        if ( elements.length === 1 && elements[0] instanceof Expression ) {
            return this.extrude( elements[0].elements );
        }
        return elements;
    }
}

Expression.tests = [
    {
        str: "1 + 1",
        result: {
            elements: [
                {number: "1"},
                {operator: "+"},
                {number: "1"}
            ]
        }
    },
    {
        str: "1::text::bigint-2 ",
        result: {
            elements: [
                {number: "1"},
                {dataType: {type: "text"}},
                {dataType: {type: "bigint"}},
                {operator: "-"},
                {number: "2"}
            ]
        }
    },
    {
        str: "{user}::bigint % 4",
        result: {
            elements: [
                {name: "user"},
                {dataType: {type: "bigint"}},
                {operator: "%"},
                {number: "4"}
            ]
        }
    },
    {
        str: "$$test$$ || E'str'",
        result: {
            elements: [
                {content: "test"},
                {operator: "||"},
                {content: "str"}
            ]
        }
    },
    {
        str: "true-false*null+1/'test'",
        result: {
            elements: [
                {boolean: true},
                {operator: "-"},
                {boolean: false},
                {operator: "*"},
                {null: true},
                {operator: "+"},
                {number: "1"},
                {operator: "/"},
                {content: "test"}
            ]
        }
    }
];

module.exports = Expression;
