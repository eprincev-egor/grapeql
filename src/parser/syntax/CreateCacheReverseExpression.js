"use strict";

const Syntax = require("./Syntax");

/*
after change orders set where
    company.id = orders.id_client
 */

class CreateCacheReverseExpression extends Syntax {
    parse(coach) {
        coach.expectWord("after");
        coach.skipSpace();
        
        coach.expectWord("change");
        coach.skipSpace();
        
        this.table = coach.parseObjectLink();
        this.addChild(this.table);
        coach.skipSpace();
        
        coach.expectWord("set");
        coach.skipSpace();
        
        coach.expectWord("where");
        coach.skipSpace();
        
        this.expression = coach.parseExpression();
        this.addChild(this.expression);
    }
    
    is(coach) {
        return coach.isWord("after");
    }
    
    clone() {
        let clone = new CreateCacheReverseExpression();
        
        clone.table = this.table.clone();
        clone.addChild(clone.table);
        
        clone.expression = this.expression.clone();
        clone.addChild(clone.expression);
        
        return clone;
    }
    
    toString() {
        let out = "";
        
        out += "after change ";
        out += this.table.toString();
        out += " set where ";
        out += this.expression.toString();
        
        return out;
    }
}

module.exports = CreateCacheReverseExpression;
