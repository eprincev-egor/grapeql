"use strict";

const {value2sql} = require("../../../helpers");

module.exports = {
    buildVars({ select, vars }) {
        if ( !this.declare ) {
            return;
        }
        vars = vars || {};
        
        let sqlByKey = {};
        let needWith = false;
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
            let sqlValue;
            
            if ( definition.default && value == null ) {
                needWith = true;
                withVars.push(`${ definition.default } as ${key}`);
                
                sqlValue = `(select ${key} from ${ withName })`;
            } else {
                sqlValue = value2sql(type, value);
            }
            
            sqlByKey[ key ] = sqlValue;
        }
        
        if ( needWith ) {
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
            
            let expression = new this.Coach.Expression("" + sqlValue);
            let element = expression.elements[0];
            
            variable.parent.replaceElement(variable, element);
        });
    }
};
