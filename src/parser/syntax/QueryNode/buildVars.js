"use strict";

const {value2sql} = require("../../../helpers");

module.exports = {
    buildVars({ select, vars }) {
        if ( !this.declare ) {
            return;
        }
        vars = vars || {};
        
        let sqlByKey = {};
        let withVars = [];
        let withName = "vars";
        
        if ( select.with ) {
            let i = 1;
            let _withName = withName;
            while (_withName in select.with.queries) {
                _withName = withName + i;
                i++;
            }
            withName = _withName;
        }
        
        for (let key in this.declare.variables) {
            let $key = "$" + key;
            let definition = this.declare.variables[ key ];
            let value = vars[ $key ];

            if ( value == null && definition.notNull ) {
                throw new Error(`expected not null value for variable: ${key}`);
            }
            
            let type = definition.getType();
            let withValue = false;
            let sqlValue;
            
            if ( definition.default && value == null ) {
                withValue = definition.default.toString();
            } else {
                sqlValue = value2sql(type, value);
            }
            
            if ( definition.check ) {
                let errorText = `variable ${ key } violates check constraint`;
                let sqlErrorText = value2sql("text", errorText);
                let value = withValue || sqlValue;
                
                let checkSql = definition.check.clone();
                checkSql.walk(variable => {
                    if ( !(variable instanceof this.Coach.SystemVariable) ) {
                        return;
                    }
                    
                    variable.parent.replaceElement(variable, value);
                });
                
                
                withValue = `case when ${checkSql} then ${ value } else raise_exception(${sqlErrorText}) end`;
            }
            
            if ( withValue ) {
                withVars.push(`${ withValue } as ${key}`);
                // variable name can be reserved word
                sqlValue = `(select ${ withName }.${key} from ${ withName })`;
            }
            
            sqlByKey[ key ] = sqlValue;
        }
        
        if ( withVars.length ) {
            if ( !select.with ) {
                select.with = new this.Coach.With();
                select.addChild(select.with);
            }
            select.with.setWithQuery(withName, "select " + withVars.join(", "));
        }
        
        select.walk(variable => {
            if ( !(variable instanceof this.Coach.SystemVariable) ) {
                return;
            }

            let key = variable.toLowerCase();
            let sqlValue = sqlByKey[ key ];
            
            variable.parent.replaceElement(variable, sqlValue);
        });
    }
};
