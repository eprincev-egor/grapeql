"use strict";

const Syntax = require("./Syntax");

/*
create cache for company (
    select
        count(*) as quantity
    from orders
    where
        orders.id_client = company.id
)

after change orders set where
    company.id = orders.id_client
 */

class CreateCache extends Syntax {
    parse(coach) {
        coach.expectWord("create");
        coach.skipSpace();
        
        coach.expectWord("cache");
        coach.skipSpace();
        
        coach.expectWord("for");
        coach.skipSpace();
        
        this.table = coach.parseObjectLink();
        this.addChild(this.table);
        coach.skipSpace();
        
        if ( coach.isWord("as") ) {
            coach.expectWord("as");
            coach.skipSpace();
            
            this.as = coach.parseObjectName();
            this.addChild(this.as);
            coach.skipSpace();
        }
        
        coach.expect("(");
        coach.skipSpace();
        
        this.select = coach.parseSelect();
        this.addChild(this.select);
        
        coach.skipSpace();
        coach.expect(")");
        
        this.reverse = coach.parseChain("CreateCacheReverseExpression");
        this.reverse.map(item => this.addChild(item));
    }
    
    is(coach) {
        return coach.is(/create\s+cache/i);
    }
    
    clone() {
        let clone = new CreateCache();
        
        clone.table = this.table.clone();
        clone.addChild(clone.table);
        
        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }
        
        clone.select = this.select.clone();
        clone.addChild(clone.select);
        
        clone.reverse = this.reverse.map(item => item.clone());
        clone.reverse.map(item => clone.addChild(item));
        
        return clone;
    }
    
    toString() {
        let out = "";
        
        out += "create cache for ";
        out += this.table.toString();
        
        if ( this.as ) {
            out += " as ";
            out += this.as.toString();    
        }
        
        out += " ( ";
        out += this.select.toString();
        out += " )";
        
        this.reverse.forEach(item => {
            out += " ";
            out += item.toString();
        });
        
        return out;
    }
}

module.exports = CreateCache;
