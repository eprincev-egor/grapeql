"use strict";

const Syntax = require("./Syntax");
const operatorsMap = require("./operators.map.js");

function equalLinkElem(left, right) {
    if ( !left && right ) {
        return false;
    }
    if ( left && !right ) {
        return false;
    }

    if ( left.content || right.content ) {
        return left.content == right.content;
    }

    return left.word.toLowerCase() == right.word.toLowerCase();
}

class Expression extends Syntax {
    constructor() {
        super();
        this.elements = [];
    }

    parse(coach, options) {
        options = options || {posibleStar: false, excludeOperators: false};

        this.parseElements( coach, options );
        this.elements = this.extrude(this.elements);
    }

    is(coach) {
        // for stopping parseComma
        return !coach.is(/[\s),]/);
    }

    parseElements(coach, options) {
        let elem, i, result;

        if ( options.posibleStar && coach.is("*") ) {
            elem = coach.parseObjectLink({ posibleStar: options.posibleStar });
            this.addChild(elem);
            this.elements.push(elem);
            return;
        }

        result = this.parseOperators(coach, options);
        if ( result === false ) {
            return;
        }

        i = coach.i;
        elem = this.parseElement( coach, options );
        if ( !elem ) {
            coach.i = i;
            coach.throwError("expected expression element");
        }
        this.addChild(elem);
        this.elements.push(elem);

        // company.id in (1,2)
        // company.id between 1 and 2
        coach.skipSpace();
        if ( coach.isBetween() || coach.isIn() ) {
            elem = this.parseElement( coach, options );
            this.addChild(elem);
            this.elements.push(elem);
        }

        // ::text::text::text
        this.parseToTypes(coach);

        // operator
        coach.skipSpace();
        if ( coach.isOperator() ) {
            let result = this.parseOperators(coach, options);
            if ( result === false ) {
                return;
            }

            this.parseElements(coach, options);
        }
    }

    parseOperators(coach, options) {
        if ( coach.isOperator() ) {
            let i = coach.i;

            let operator = coach.parseOperator();

            if ( options.excludeOperators ) {
                if ( options.excludeOperators.includes(operator.operator) ) {
                    coach.i = i;
                    return false;
                }
            }

            this.addChild(operator);
            this.elements.push( operator );
            coach.skipSpace();

            this.parseOperators(coach, options);
        }
    }

    parseElement(coach, options) {
        let elem;

        // sub expression
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();

            if ( coach.isSelect() ) {
                elem = coach.parseSelect();
            } else {
                elem = coach.parseExpression();
            }

            coach.skipSpace();
            coach.expect(")");
        }

        else if ( coach.isCast() ) {
            elem = coach.parseCast();
        }

        else if ( coach.isIn() ) {
            elem = coach.parseIn();
        }

        else if ( coach.isBetween() ) {
            elem = coach.parseBetween();
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
        let Select = this.Coach.Select;
        let out = "";

        this.elements.forEach((elem, i) => {
            if ( i > 0 ) {
                out += " ";
            }

            if ( elem instanceof Expression || elem instanceof Select ) {
                out += "( ";
                out += elem.toString();
                out += " )";
            } else {
                out += elem.toString();
            }
        });

        return out;
    }

    // params.server
    // params.node
    getType( params ) {
        let map = [];

        for (let i = 0, n = this.elements.length; i < n; i++) {
            let elem = this.elements[i];

            if ( elem.operator ) {
                map.push( elem );
            } else if ( elem.dataType ) {
                map.pop();
                map.push( elem.dataType.type );
            } else {
                map.push( elem.getType(params) );
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

    replaceLink(replace, to) {
        let coach;

        if ( typeof replace == "string" ) {
            coach = new this.Coach(replace);
            replace = coach.parseObjectLink().link;
        }

        if ( typeof to == "string" ) {
            coach = new this.Coach(to);
            to = coach.parseObjectLink().link;
        }


        const Expression = this.Coach.Expression;
        const ObjectLink = this.Coach.ObjectLink;
        const Cast = this.Coach.Cast;
        const In = this.Coach.In;
        const Between = this.Coach.Between;
        const CaseWhen = this.Coach.CaseWhen;
        const FunctionCall = this.Coach.FunctionCall;
        const Select = this.Coach.Select;

        this.elements.forEach(elem => {
            if ( elem instanceof Expression ) {
                elem.replaceLink(replace, to);
            }

            if ( elem instanceof ObjectLink ) {
                this._replaceLink(elem.link, replace, to);
            }

            if ( elem instanceof Cast ) {
                elem.expression.replaceLink(replace, to);
            }

            if ( elem instanceof In ) {
                if ( Array.isArray(elem.in) ) {
                    elem.in.forEach(
                        expression => expression.replaceLink(replace, to)
                    );
                } else {
                    // in (select ...)
                    return elem.in.replaceLink(replace, to);
                }
            }

            if ( elem instanceof Between ) {
                elem.start.replaceLink(replace, to);
                elem.end.replaceLink(replace, to);
            }

            if ( elem instanceof CaseWhen ) {
                if ( elem.else ) {
                    elem.else.replaceLink(replace, to);
                }

                elem.case.forEach(caseElem => {
                    caseElem.when.replaceLink(replace, to);
                    caseElem.then.replaceLink(replace, to);
                });
            }

            if ( elem instanceof FunctionCall ) {
                elem.arguments.forEach(
                    arg => arg.replaceLink(replace, to)
                );
            }

            if ( elem instanceof Select ) {
                elem.replaceLink(replace, to);
            }
        });
    }

    _replaceLink(link, replace, to) {
        if ( link.length < replace.length ) {
            return;
        }

        let spliceLength = 0;
        for (let
            i = 0,
            n = link.length,
            m = replace.length;
            i < n && i < m;
            i++
        ) {
            let elem = link[i];
            let replaceElem = replace[i];

            if ( !equalLinkElem(elem, replaceElem) ) {
                return;
            }
            spliceLength++;
        }

        for (let i = 0; i < spliceLength; i++) {
            link.shift();
        }

        for (let i = to.length - 1; i >= 0 ; i--) {
            link.unshift( to[i] );
        }
    }
}

module.exports = Expression;
