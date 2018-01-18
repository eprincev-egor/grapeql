"use strict";

const _ = require("lodash");
const ConditionElement = require("./ConditionElement");
const UnaryCondition = require("./UnaryCondition");

function isConditionElement(arr) {
    return (
        _.isArray(arr) &&
        arr.length === 3 &&
        _.isString(arr[0]) &&
        _.isString(arr[1])
    );
}

function isAnd(conditionOperator) {
    conditionOperator = (conditionOperator + "").trim().toLowerCase();
    return conditionOperator == "and" || conditionOperator == "&&";
}

function isOr(conditionOperator) {
    conditionOperator = (conditionOperator + "").trim().toLowerCase();
    return conditionOperator == "or" || conditionOperator == "||";
}

function isNot(conditionOperator) {
    conditionOperator = (conditionOperator + "").trim().toLowerCase();
    return conditionOperator == "not" || conditionOperator == "!";
}

class Condition {
    constructor(arr) {
        this.initElements(arr);

        this.noRows = false;
        let element;
        for (let i = 0, n = this.elements.length; i < n; i++) {
            element = this.elements[i];

            if ( element.noRows ) {
                this.noRows = true;
                break;
            }
        }
    }

    initElements(arr) {
        this.elements = [];

        if ( isConditionElement(arr) ) {
            this.elements.push(
                new ConditionElement(arr)
            );
            return;
        }

        let element,
            conditionOperator,
            nextElement,
            prevElement;

        for (let i = 0, n = arr.length; i < n; i++) {
            element = arr[ i ];
            prevElement = arr[ i - 1 ];
            nextElement = arr[ i + 1 ];

            conditionOperator = false;
            if ( _.isString(element) ) {
                conditionOperator = element.toLowerCase().trim();
            }

            if ( isNot(conditionOperator) ) {
                if ( !_.isArray(nextElement) ) {
                    throw new Error("invalid UnaryCondition");
                }

                this.elements.push(
                    new UnaryCondition(element, new Condition(nextElement))
                );
                i++;
            }

            else if ( isAnd(conditionOperator) || isOr(conditionOperator) ) {
                this.elements.push(element);

                if ( !_.isArray(prevElement) ) {
                    throw new Error("invalid BinaryCondition");
                }

                if ( !_.isArray(nextElement) ) {
                    throw new Error("invalid BinaryCondition");
                }
            }

            else if ( isConditionElement(element) ) {
                this.elements.push(
                    new ConditionElement(element)
                );
            }

            else if ( _.isArray(element) ) {
                this.elements.push(
                    new Condition(element)
                );
            }

            else {
                throw new Error("invalid condition element: " + element);
            }
        }
    }

    compile2js() {
        let elements = this.elements,
            element,
            conditionOperator,
            result = "",
            i, n;

        if ( !elements.length ) {
            return "true";
        }

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            conditionOperator = false;
            if ( _.isString(element) ) {
                conditionOperator = element.toLowerCase().trim();
            }

            if ( isAnd(conditionOperator) ) {
                result += " && ";
            }
            else if ( isOr(conditionOperator) ) {
                result += " || ";
            }
            else {
                result += " (" + element.compile2js() + ") ";
            }
        }

        return result;
    }

    /*
    // usage example:

    // can be [[], "and", []]
    let filter = [this.filter.toJSON(), "and", this.sysFilter.toJSON()];

    if ( this._search ) {
        filter = [filter, "and", this._search2filter( this._search )];
    }
    filter = new Filter3( filter );

    if ( !filter.isEmpty() ) {
        params.filter = filter;
    }

     */
    compile2json() {
        if ( this.isEmpty() ) {
            return [];
        }

        let elements = this.elements,
            element,
            nextElement,
            prevElement,
            conditionOperator,
            result = [],
            i, n;

        if ( !elements.length ) {
            return [];
        }

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            conditionOperator = false;
            if ( _.isString(element) ) {
                conditionOperator = element.toLowerCase().trim();
            }

            // and/or
            if ( conditionOperator ) {
                nextElement = elements[ i + 1 ];

                if ( nextElement.isEmpty() ) {
                    i++;
                    continue;
                }

                if ( i === 1 ) {
                    prevElement = elements[ i - 1 ];

                    if ( prevElement.isEmpty() ) {
                        continue;
                    }
                }

                result.push( conditionOperator );
            }

            // ConditionElement or Condition
            else {
                element = element.compile2json();

                if ( element && element.length ) {
                    result.push( element );
                }
            }
        }

        if ( result.length === 1 && _.isArray(result[0]) ) {
            return result[0];
        }

        return result;
    }
    
    compile2sql(model) {
        let elements = this.elements,
            element,
            conditionOperator,
            result = "",
            i, n;

        if ( !elements.length ) {
            return "true";
        }

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            conditionOperator = false;
            if ( _.isString(element) ) {
                conditionOperator = element.toLowerCase().trim();
            }

            if ( isAnd(conditionOperator) ) {
                result += " and ";
            }
            else if ( isOr(conditionOperator) ) {
                result += " or ";
            }
            else {
                result += " (" + element.compile2sql(model) + ") ";
            }
        }

        return result;
    }

    isEmpty() {
        let elements = this.elements,
            element,
            i, n;

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            if ( element.isEmpty && !element.isEmpty() ) {
                return false;
            }
        }

        return true;
    }

    hasColumn(column) {
        let elements = this.elements,
            element,
            i, n;

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            if ( element.hasColumn && element.hasColumn(column) ) {
                return true;
            }
        }

        return false;
    }

    each(iterator, context) {
        if ( !_.isFunction(iterator) ) {
            return;
        }

        let elements = this.elements,
            element,
            i, n;

        for (i = 0, n = elements.length; i < n; i++) {
            element = elements[ i ];

            if ( element instanceof Condition ) {
                element.each(iterator, context);
            }
            if ( element instanceof UnaryCondition ) {
                element.each(iterator, context);
            }
            if ( element instanceof ConditionElement ) {
                iterator.call(context, element.compile2json());
            }
        }
    }
}

module.exports = Condition;
