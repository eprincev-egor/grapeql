"use strict";

const Syntax = require("../syntax/Syntax");

class Expression extends Syntax {
    constructor() {
        super();
        this.elements = [];
    }
    
    parse(coach, expression) {
        expression = expression instanceof Expression ? expression : this;
        let elem;
        
        coach.skipSpace();
        
        // operator
        if ( coach.isOperator() ) {
            expression.elements.push( coach.parseOperator() );
            coach.skipSpace();
        }
        
        // sub expression
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();
            
            elem = coach.parseExpression();
            
            coach.skipSpace();
            coach.expectRead(")");
        }
        
        // number 
        else if ( coach.isPgNumber() ) {
            elem = coach.parsePgNumber();
        }
        
        // string
        else if ( coach.isPgString() ) {
            elem = coach.parsePgString();
        }
        
        // case when then else end
        else if ( coach.isCaseWhen() ) {
            elem = coach.parseCaseWhen();
        }
        
        // case when then else end
        else if ( coach.is(/select\s/i) ) {
            elem = coach.parseSelect();
        }
        
        else if ( coach.isPgNull() ) {
            elem = coach.parsePgNull();
        }
        
        else if ( coach.isSystemVariable() ) {
            elem = coach.parseSystemVariable();
        }
        
        else if ( coach.isFunctionCall() ) {
            elem = coach.parseFunctionCall();
        }
        
        /*
        // [ scheme . ] table . column
        else if ( coach.isObjectName() ) {
            elem = coach.parseColumnName();
        }
        */
       
        // expression.addChild(elem);
        expression.elements.push(elem);
        coach.skipSpace();
        
        // 'something'::int
        if ( coach.is(/::/) ) {
            coach.skipSpace();
            coach.i += 2; // ::
            
            expression.dataType = coach.readDataType();
            coach.skipSpace();
        }
        
        coach.skipSpace();
        
        // operator
        if ( coach.isOperator() ) {
            coach.parseExpression( expression );
        }
        
        this.elements = this.extrude().elements;
    }
    
    // ((( expression )))  достаем выражение из лишних скобок
    extrude() {
        if ( this.elements.length === 1 && this.elements[0] instanceof Expression ) {
            return this.elements[0].extrude();
        }
        return this;
    }
}

Expression.tests = [
    {
        str: "1 + 1",
        result: {
            elements: [
                {value: "1"},
                {value: "+"},
                {value: "1"}
            ]
        }
    }
];

module.exports = Expression;
