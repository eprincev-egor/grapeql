"use strict";

const Syntax = require("../Syntax");

let methods = [
    require("./buildFromFiles"),
    require("./buildCount"),
    require("./buildDelete"),
    require("./buildIndexOf"),
    require("./buildInsert"),
    require("./buildSelect"),
    require("./buildUpdate"),
    require("./buildVars")
];

class QueryNode extends Syntax {
    parse(coach) {
        if ( coach.isDeclare() ) {
            this.declare = coach.parseDeclare();
            this.addChild(this.declare);
            coach.skipSpace();
        }

        this.select = coach.parseSelect();
        this.addChild(this.select);

        this.select.walk(variable => {
            if ( !(variable instanceof this.Coach.SystemVariable) ) {
                return;
            }

            let key = variable.toLowerCase();
            if ( !this.declare || !(key in this.declare.variables) ) {
                coach.throwError(`undefined variable: ${key}`);
            }
        });
    }

    is(coach) {
        return coach.isDeclare() || coach.isSelect();
    }

    clone() {
        let clone = new QueryNode();

        if ( this.declare ) {
            clone.declare = this.declare.clone();
            clone.addChild(clone.declare);
        }

        clone.select = this.select.clone();
        clone.addChild(clone.select);

        return clone;
    }

    toString() {
        let out = "";

        if ( this.declare ) {
            out += this.declare.toString();
            out += " ";
        }

        out += this.select.toString();

        return out;
    }
}

methods.forEach(methods => {
    for (let key in methods) {
        QueryNode.prototype[ key ] = methods[ key ];
    }
});

module.exports = QueryNode;
