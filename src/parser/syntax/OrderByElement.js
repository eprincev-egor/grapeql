"use strict";

const Syntax = require("./Syntax");

class OrderByElement extends Syntax {
    parse(coach) {
        this.expression = coach.parseExpression();
        this.addChild(this.expression);
        coach.skipSpace();
        
        if ( coach.is(/asc|desc/i) ) {
            this.vector = coach.readWord().toLowerCase();
            coach.skipSpace();
        } 
        else if ( coach.is(/using\s/) ) {
            coach.readWord(); // using
            coach.skipSpace();
            
            this.using = coach.parseOperator();
            this.addChild(this.using);
        }
        
        if ( coach.is(/nulls\s+(first|last)/i) ) {
            coach.skipSpace();
            coach.readWord(); // nulls
            coach.skipSpace();
            
            this.nulls = coach.readWord().toLowerCase();
        }
    }
    
    is(coach) {
        return coach.isExpression();
    }
    
    clone() {
        let clone = new OrderByElement();
        clone.expression = this.expression.clone();
        clone.addChild(clone.expression);
        
        if ( this.vector ) {
            clone.vector = this.vector;
        } 
        else if ( this.using ) {
            clone.using = this.using;
        }
        
        if ( this.nulls ) {
            clone.nulls = this.nulls;
        }
        
        return clone;
    }
    
    toString() {
        let out = this.expression.toString();
        
        if ( this.vector ) {
            out += " " + this.vector;
        } 
        else if ( this.using ) {
            out += " using " + this.using.toString();
        }
        
        if ( this.nulls ) {
            out += " nulls " + this.nulls;
        }
        
        return out;
    }
}

module.exports = OrderByElement;
