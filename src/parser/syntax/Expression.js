"use strict";

const Syntax = require("./Syntax");

class Expression extends Syntax {
    constructor() {
        super();
        this.elements = [];
    }
    
    parse(coach, options) {
        options = options || {posibleStar: false};
        
        this.parseElements( coach, options );
        this.elements = this.extrude(this.elements);
    }
    
    is(coach) {
        // for stopping parseComma
        return !coach.is(/[\s),]/);
    }
    
    parseElements(coach, options) {
        let elem, i;
        
        if ( options.posibleStar && coach.is("*") ) {
            elem = coach.parseObjectLink({ posibleStar: options.posibleStar });
            this.elements.push(elem);
            return;
        }
        
        this.parseOperators(coach);
        
        i = coach.i;
        elem = this.parseElement( coach, options );
        if ( !elem ) {
            coach.i = i;
            coach.throwError("expected expression element");
        }
        this.elements.push(elem);
        
        // ::text::text::text
        coach.skipSpace();
        this.parseToTypes(coach);
        
        // operator
        coach.skipSpace();
        if ( coach.isOperator() ) {
            this.parseOperators(coach);
            
            this.parseElements(coach, options);
        }
    }
    
    parseOperators(coach) {
        if ( coach.isOperator() ) {
            let operator = coach.parseOperator();
            this.elements.push( operator );
            coach.skipSpace();
            
            this.parseOperators(coach);
        }
    }
    
    parseElement(coach, options) {
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
        
        else if ( coach.isPgString() ) {
            elem = coach.parsePgString();
        }
        
        else if ( coach.isCaseWhen() ) {
            elem = coach.parseCaseWhen();
        }
        
        else if ( coach.isSystemVariable() ) {
            elem = coach.parseSystemVariable();
        }
        
        else if ( coach.isFunctionCall() ) {
            elem = coach.parseFunctionCall();
        }
        
        else if ( coach.isObjectLink() ) {
            elem = coach.parseObjectLink({ posibleStar: options.posibleStar });
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
    
    isLink() {
        return this.elements.length === 1 && !!this.elements[0].link;
    }
    
    getLink() {
        return this.elements[0];
    }
    
    clone() {
        let clone = new Expression();
        clone.elements = this.elements.map(elem => elem.clone());
        return clone;
    }
    
    toString() {
        let out = "";
        
        this.elements.forEach((elem, i) => {
            if ( i > 0 ) {
                out += " ";
            }
            
            if ( elem instanceof Expression ) {
                out += "( ";
                out += elem.toString();
                out += " )";
            } else {
                out += elem.toString();
            }
        });
        
        return out;
    }
}

module.exports = Expression;
