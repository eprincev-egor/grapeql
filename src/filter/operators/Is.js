"use strict";

const Operator = require("./Operator");
const _ = require("lodash");
const {
    isSqlDate,
    wrapDate
} = require("../../helpers");

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
    
    compile2sql(column, value) {
        value = value.toLowerCase().trim().replace(/\s+/g, " ");
        
        if ( value === "null" ) {
            return column.sql + " is null";
        } 
        else if ( value === "not null" ) {
            return column.sql + " is not null";
        } 
        else if ( value === "today" ) {
            if ( !isSqlDate(column.type) ) {
                throw new Error("imposible check 'is today' for column type: " + column.type);
            }
            
            let startSql = todayStart();
            let endSql = todayEnd();
            
            startSql = new Date(startSql);
            startSql = wrapDate(startSql, column.type);
            
            endSql = new Date(endSql);
            endSql = wrapDate(endSql, column.type);
            
            return column.sql + " >= " + startSql + " and " + column.sql + " <= " + endSql;
        } 
        else if ( value === "tomorrow" ) {
            if ( !isSqlDate(column.type) ) {
                throw new Error("imposible check 'is tomorrow' for column type: " + column.type);
            }
            
            let startSql = tomorrowStart();
            let endSql = tomorrowEnd();
            
            startSql = new Date(startSql);
            startSql = wrapDate(startSql, column.type);
            
            endSql = new Date(endSql);
            endSql = wrapDate(endSql, column.type);
            
            return column.sql + " >= " + startSql + " and " + column.sql + " <= " + endSql;
        }
    }
}

Operator.addLiteral(["is"], Is);

module.exports = Is;
