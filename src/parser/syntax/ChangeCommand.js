"use strict";

const Syntax = require("./Syntax");
const Column = require("./Column");

// Class helper
class ChangeCommand extends Syntax {
    parseReturning(coach) {
        coach.skipSpace();
        
        let indexBeforeReturning = coach.i;
        if ( coach.isWord("returning") ) {
            if ( this.returningObject ) {
                // this.commandType defined in Child Classes
                coach.throwError(`${ this.commandType } row should be without returning clause`);
            }

            coach.expectWord("returning");
            coach.skipSpace();

            if ( this.options.allowCustomReturning ) {
                if ( coach.isWord("row") ) {
                    coach.expectWord("row");
                    coach.skipSpace();
                    
                    this.returningObject = true;
                    // need for toStringReturning
                    this._returningRow = true;
                }
                else if ( coach.isWord("value") ) {
                    coach.expectWord("value");
                    coach.skipSpace();
                    
                    this.returningValue = true;
                    // need for toStringReturning
                    this._returningValue = true;
                }
            }

            
            if ( this.returningValue ) {
                if ( !coach.isColumn() ) {
                    coach.i = indexBeforeReturning;
                    coach.throwError("returning value should have one column");
                }
            }
            if ( this.returningObject ) {
                if ( !coach.isColumn() ) {
                    coach.i = indexBeforeReturning;
                    coach.throwError("returning row should have one column");
                }
            }
            
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

            if ( this.returningValue ) {
                let firstColumn = returning[0];

                if ( firstColumn.isStar() ) {
                    coach.i = indexBeforeReturning;
                    coach.throwError("returning value can't use with star");
                }
            }
            
            this.returning = returning;
            this.returning.forEach(column => this.addChild(column));
        }
    }

    cloneReturning(clone) {
        if ( this.returning ) {
            clone.returning = this.returning.map(column => column.clone());
            clone.returning.forEach(column => clone.addChild(column));
        }
        if ( this._returningRow ) {
            clone._returningRow = true;
        }
        if ( this._returningValue ) {
            clone._returningValue = true;
        }
    }

    toStringReturning(options) {
        options = options || {pg: false};
        let out = "";
        
        if ( this.returning ) {
            out += " returning ";
            if ( !options.pg ) {
                if ( this._returningRow ) {
                    out += " row ";
                }
                if ( this._returningValue ) {
                    out += " value ";
                }
            }
            out += this.returning.map(column => column.toString()).join(", ");
        }

        return out;
    }

    addReturning(sql) {
        if ( !this.returning ) {
            this.returning = [];
        }
        
        let column = new Column(sql);
        this.addChild(column);
        
        this.returning.push(column);
    }
}

module.exports = ChangeCommand;