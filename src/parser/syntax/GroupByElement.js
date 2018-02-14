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
            this.groupingSets.map(elem => this.addChild(elem));
            
            coach.skipSpace();
            coach.expect(")");
        } 
        
        else {
            this.expression = coach.parseExpression();
            this.addChild(this.expression);
        }
    }
    
    parseElements(coach) {
        let elements = coach.parseComma({
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
        elements.map(elem => this.addChild(elem));
        return elements;
    }
    
    is(coach) {
        return (
            coach.isWord("rollup") ||
            coach.isWord("cube") ||
            coach.isWord("grouping") ||
            coach.isExpression()
        );
    }
    
    clone() {
        let clone = new GroupByElement();
        
        if ( this.isEmpty ) {
            clone.isEmpty = true;
        }
        
        if ( this.rollup ) {
            clone.rollup = this.cloneItems( this.rollup );
            clone.rollup.map(elem => clone.addChild(elem));
        }
        else if ( this.cube ) {
            clone.cube = this.cloneItems( this.cube );
            clone.cube.map(elem => clone.addChild(elem));
        }
        else if ( this.groupingSets ) {
            clone.groupingSets = this.groupingSets.map(set => set.clone());
            clone.groupingSets.map(elem => clone.addChild(elem));
        }
        else if ( this.expression ) {
            clone.expression = this.expression.clone();
            clone.addChild(clone.expression);
        }
        
        return clone;
    }
    
    cloneItems(items) {
        let out = [];
        
        items.forEach(item => {
            if ( item.elements ) {// is expression
                out.push( item );
            } else {
                out.push(
                    item.map(subItem => subItem.clone())
                );
            }
        });
        
        return out;
    }
    
    toString() {
        if ( this.isEmpty ) {
            return "()";
        }
        
        let out = "";
        if ( this.rollup ) {
            out += "rollup (" + this.items2string( this.rollup ) + ")";
        }
        else if ( this.cube ) {
            out += "cube (" + this.items2string( this.cube ) + ")";
        }
        else if ( this.groupingSets ) {
            out += "grouping sets (";
            out += this.groupingSets.map(set => set.toString()).join(", ");
            out += ")";
        }
        else {
            out += this.expression.toString();
        }
        
        return out;
    }
    
    items2string(items) {
        let out = "";
        
        items.forEach((item, i) => {
            if ( i > 0 ) {
                out += ", ";
            }
            
            if ( item.elements ) {// is expression
                out += item.toString();
            } else {
                out += "(";
                out += item.map(subItem => subItem.toString()).join(", ");
                out += ")";
            }
        });
        
        return out;
    }
}

module.exports = GroupByElement;
