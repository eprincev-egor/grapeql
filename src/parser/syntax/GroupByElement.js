"use strict";

const Syntax = require("./Syntax");

/*
    ()
    expression
    ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
    CUBE ( { expression | ( expression [, ...] ) } [, ...] )
    GROUPING SETS ( grouping_element [, ...] )
 */
class GroupByElement extends Syntax {
    parse(coach) {
        
        if ( coach.is(/\(\s*\)/) ) {
            coach.expect(/\(\s*\)/);
            this.isEmpty = true;
        }
        
        else if ( coach.isWord("rollup") ) {
            coach.expectWord("rollup");
            coach.skipSpace();
            
            coach.expect("(");
            coach.skipSpace();
            
            this.rollup = this.parseElements(coach);
            
            coach.skipSpace();
            coach.expect(")");
        } 
        
        else if ( coach.isWord("cube") ) {
            coach.expectWord("cube");
            coach.skipSpace();
            
            coach.expect("(");
            coach.skipSpace();
            
            this.cube = this.parseElements(coach);
            
            coach.skipSpace();
            coach.expect(")");
        } 
        
        else if ( coach.isWord("grouping") ) {
            coach.expectWord("grouping");
            coach.skipSpace();
            
            coach.expectWord("sets");
            coach.skipSpace();
            
            coach.expect("(");
            coach.skipSpace();
            
            this.groupingSets = coach.parseComma("GroupByElement");
            
            coach.skipSpace();
            coach.expect(")");
        } 
        
        else {
            this.expression = coach.parseExpression();
        }
    }
    
    parseElements(coach) {
        return coach.parseComma({
            is: () => {
                return coach.isExpression();
            },
            parse: () => {
                if ( coach.is("(") ) {
                    coach.expect("(");
                    coach.skipSpace();
                    
                    let subElements = coach.parseComma("Expression");
                    
                    coach.skipSpace();
                    coach.expect(")");
                    
                    return subElements;
                } else {
                    return coach.parseExpression();
                }
            }
        });
    }
    
    is(coach) {
        return (
            coach.isWord("rollup") ||
            coach.isWord("cube") ||
            coach.isWord("grouping") ||
            coach.isExpression()
        );
    }
}

module.exports = GroupByElement;
