"use strict";

const Syntax = require("./Syntax");

// Class helper
class ChangeCommand extends Syntax {
    parseReturning(coach) {
        coach.skipSpace();
        
        if ( coach.isWord("returning") ) {
            coach.expectWord("returning");
            coach.skipSpace();

            let i = coach.i;
            let returning = coach.parseComma("Column");

            returning.forEach(column => {
                let alias = column.getLowerAlias();
                if ( !alias ) {
                    return;
                }

                if ( alias[0] == "$" ) {
                    coach.i = i;
                    coach.throwError("$ is reserved symbol for alias");
                }
            });
            
            this.returning = returning;
            this.returning.forEach(column => this.addChild(column));
        }
    }

    cloneReturning(clone) {
        if ( this.returning ) {
            clone.returning = this.returning.map(column => column.clone());
            clone.returning.forEach(column => clone.addChild(column));
        }
    }

    toStringReturning() {
        let out = "";
        
        if ( this.returning ) {
            out += " returning ";
            out += this.returning.map(column => column.toString()).join(", ");
        }

        return out;
    }
}

module.exports = ChangeCommand;