"use strict";

const Operator = require("./Operator");
const _ = require("lodash");

function todayStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayEnd() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function tomorrowStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 );
}

function tomorrowEnd() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 23, 59, 59, 999);
}

class Is extends Operator {
    validateValue(value) {
        if ( !_.isString(value) ) {
            return false;
        }

        value = value.toLowerCase().trim().replace(/\s+/g, " ");
        return (
            value === "null" ||
            value === "not null" ||
            value === "today" ||
            value === "tomorrow"
        );
    }

    compile2js(left, right) {
        right = right.toLowerCase().trim().replace(/\s+/g, " ");

        if ( right === "null" ) {
            return left + " == null";
        } 
        else if ( right === "not null" ) {
            return left + " != null";
        } 
        else if ( right === "today" ) {
            return left + " >= " + todayStart() + " && " + left + " <= " + todayEnd();
        } 
        else if ( right === "tomorrow" ) {
            return left + " >= " + tomorrowStart() + " && " + left + " <= " + tomorrowEnd();
        }
        else {
            throw new Error("imposible check: " + right);
        }
    }
}

Operator.addLiteral(["is"], Is);

module.exports = Is;
