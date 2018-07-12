"use strict";

const Syntax = require("../Syntax");

class QueryNode extends Syntax {
    parse(coach) {
        if ( coach.isDeclare() ) {
            this.declare = coach.parseDeclare();
            this.addChild(this.declare);
            coach.skipSpace();
        }

        this.select = coach.parseSelect();
        this.addChild(this.select);

        this.select.walk(child => {
            if ( child instanceof this.Coach.SystemVariable ) {
                let variable = child;

                let key = variable.toLowerCase();
                if ( !this.declare || !(key in this.declare.variables) ) {
                    coach.i = variable.startIndex;
                    coach.throwError(`undefined variable: ${key}`);
                }
            }

            if ( child instanceof this.Coach.Insert) {
                coach.i = child.startIndex;
                coach.throwError("insert is not allowed");
            }

            if ( child instanceof this.Coach.Update ) {
                coach.i = child.startIndex;
                coach.throwError("update is not allowed");
            }

            if ( child instanceof this.Coach.Delete ) {
                coach.i = child.startIndex;
                coach.throwError("delete is not allowed");
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

module.exports = QueryNode;
