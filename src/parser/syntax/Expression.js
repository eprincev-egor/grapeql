"use strict";

const Syntax = require("./Syntax");
const operatorsMap = require("./operators.map.js");

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
            this.addChild(elem);
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
        this.addChild(elem);
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
            this.addChild(operator);
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
            this.addChild(elem);
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
        clone.elements.map(elem => clone.addChild(elem));
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
    
    getType() {
        let map = [];
        
        for (let i = 0, n = this.elements.length; i < n; i++) {
            let elem = this.elements[i];
            
            if ( elem.operator ) {
                map.push( elem );
            } else if ( elem.dataType ) {
                map.pop();
                map.push( elem.dataType.type );
            } else {
                map.push( elem.getType() );
            }
        }
        
        // math unary
        
        // math first unary operators
        // - +'1' * 2
        if ( map.length && map[0].operator ) {
            let firstUnaryOperators = [],
                firstOperand;
            
            for (let i = 0, n = map.length; i < n; i++) {
                let elem = map[i];
                
                if ( !elem.operator ) {
                    firstOperand = elem;
                    break;
                }
                
                firstUnaryOperators.push(elem.operator);
            }
            
            firstOperand = this._mathUnary(firstUnaryOperators, firstOperand);
            map.splice(0, firstUnaryOperators.length + 1, firstOperand);
        }
        
        // math another unary
        // 1 - + 2
        for (let i = 0, n = map.length; i < n; i++) {
            let elem = map[i];
            
            if ( elem.operator ) {
                let unaryOperators = [],
                    operand;
                
                for (let j = i + 1; j < n; j++) {
                    elem = map[j];
                    
                    if ( elem.operator ) {
                        unaryOperators.push( elem.operator );
                    } else {
                        operand = elem;
                        break;
                    }
                }
                
                if ( unaryOperators.length ) {
                    operand = this._mathUnary( unaryOperators, operand );
                    
                    map.splice(i + 1, unaryOperators.length + 1, operand);
                    n -= unaryOperators.length + 1;
                }
            }
        }
        
        // math binary
        let allOperators = [];
        
        for (let i = 0, n = map.length; i < n; i++) {
            let elem = map[i];
            
            if ( elem.operator ) {
                let binaryOperatorMap = operatorsMap.binary[ elem.operator ];
                
                if ( !binaryOperatorMap ) {
                    throw new Error(`unknown binary operator ${ elem.operator }`);
                }
                
                allOperators.push( elem.operator );
            }
        }
        
        // sort by operator precedence
        allOperators = allOperators.sort((a, b) => {
            a = operatorsMap.binary[a];
            b = operatorsMap.binary[b];
            
            a = a ? a.precedence : 1 / 0;
            b = b ? b.precedence : 1 / 0;
            
            return a > b ? 1 : -1;
        });
        
        allOperators.forEach(operator => {
            let binaryOperatorMap = operatorsMap.binary[ operator ];
            
            for (let i = 1, n = map.length; i < n; i++) {
                let elem = map[i],
                    prevElem = map[i - 1],
                    nextElem = map[i + 1];
            
                if ( 
                    typeof prevElem == "string" &&
                    elem.operator == operator &&
                    typeof nextElem == "string"
                ) {
                    prevElem = prevElem.split("(")[0];
                    nextElem = nextElem.split("(")[0];
                    
                    let type = binaryOperatorMap.types.find(type => (
                        type.left == prevElem && 
                        type.right == nextElem
                    ));
                    
                    if ( type ) {
                        map.splice(i - 1, 3, type.result);
                        n -= 2;
                        i--;
                    } else {
                        throw new Error(`unknown binary operator "${ prevElem } ${ elem.operator } ${ nextElem }"`);
                    }
                }
            }
        });
        
        if ( map.length !== 1 ) {
            throw new Error(`something wrong ${ map }`);
        }
        
        return map[0];
    }
    
    _mathUnary(unaryOperators, operand) {
        if ( !operand ) {
            throw new Error(`not found operand for unary operator ${  unaryOperators[ unaryOperators.length - 1 ] }`);
        }
        
        for (let n = unaryOperators.length, i = n - 1; i >= 0; i--) {
            let unaryOperator = unaryOperators[ i ];
            let unaryMap = operatorsMap.unary[ unaryOperator ];
            
            if ( !unaryMap ) {
                throw new Error(`unknown unary operator "${ unaryOperator } ${ operand }"`);
            }
            
            let type = unaryMap.types.find(type => type.right == operand);
            
            if ( !type ) {
                throw new Error(`unknown unary operator "${ unaryOperator } ${ operand }"`);
            }
            
            operand = type.result;
        }
        
        return operand;
    }
}

module.exports = Expression;
