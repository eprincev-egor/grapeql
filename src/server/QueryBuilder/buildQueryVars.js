"use strict";

const {value2sql} = require("../../helpers");
const SystemVariable = require("../../parser/syntax/SystemVariable");

function buildQueryVars(query, vars) {
    query.walk(variable => {
        if ( !(variable instanceof SystemVariable) ) {
            return;
        }

        let expression = variable.parent;
        let type = expression.getVariableType(variable);
        if ( !type ) {
            throw new Error(`expected type for variable: ${variable}`);
        }

        let key = variable.toLowerCase();
        let $key = "$" + key;
        
        if ( $key in vars && key in vars ) {
            throw new Error(`duplicated variable name, please only one of ${key} or ${key}`);
        }

        let value;
        if ( $key in vars ) {
            value = vars[ $key ];
        } else {
            value = vars[ key ];
        }
        
        let sqlValue = value2sql(type, value);
        expression.replaceVariableWithType(variable, sqlValue);
    });
}

module.exports = buildQueryVars;