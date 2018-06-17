"use strict";

const Syntax = require("./Syntax");

class Declare extends Syntax {
    parse(coach) {
        coach.expectWord("declare");
        coach.skipSpace();

        this.variables = {};
        this.variablesArr = [];
        this.parseVariable(coach);
    }

    parseVariable(coach) {
        let index = coach.i;
        let variable = coach.parseVariableDefinition();
        let key = variable.name.toLowerCase();

        if ( key in this.variables ) {
            if ( key in this.columns ) {
                coach.i = index;
                coach.throwError(`duplicate variable name ${key}`);
            }
        }

        this.variables[ key ] = variable;
        this.variablesArr.push(variable);
        this.addChild(variable);

        coach.skipSpace();
        coach.expect(";");

        coach.skipSpace();
        if ( coach.isVariableDefinition() ) {
            this.parseVariable(coach);
        }
    }

    is(coach) {
        return coach.isWord("declare");
    }

    clone() {
        let clone = new Declare();

        clone.variables = {};
        clone.variablesArr = [];

        this.variablesArr.forEach(variable => {
            variable = variable.clone();
            let key = variable.name.toLowerCase();

            clone.variables[ key ] = variable;
            clone.variablesArr.push(variable);
            clone.addChild(variable);
        });

        return clone;
    }

    toString() {
        let out = "declare ";

        out += this.variablesArr.map(variable => variable.toString()).join("; ");
        out += ";";
        
        return out;
    }
}

module.exports = Declare;
