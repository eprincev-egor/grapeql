"use strict";
/*
extention name for table (
    extention_item [, ...]
)
where extention_item is:
    column_definition |
    table_constraint
 */
const Syntax = require("./Syntax");

class Extention extends Syntax {
    parse(coach) {
        coach.expectWord("extention");
        coach.skipSpace();
        
        this.name = coach.parseObjectName();
        this.addChild(this.name);
        coach.skipSpace();
        
        coach.expectWord("for");
        coach.skipSpace();
        
        this.table = coach.parseObjectLink();
        this.addChild(this.table);
        coach.skipSpace();
        
        coach.expect("(");
        coach.skipSpace();
        
        this.columns = {};
        this.columnsArr = [];
        this.constraints = [];
        this.parseBody(coach);
        
        coach.skipSpace();
        coach.expect(")");
    }
    
    parseBody(coach) {
        if ( coach.isTableConstraint() ) {
            let constraint = coach.parseTableConstraint();
            this.constraints.push(constraint);
            this.addChild(constraint);
        } else {
            let index = coach.i;
            let column = coach.parseColumnDefinition();
            let key = column.name.toLowerCase();
            
            if ( key in this.columns ) {
                coach.i = index;
                coach.throwError(`duplicate column name ${key}`);
            }
            
            this.columns[ key ] = column;
            this.columnsArr.push(column);
            this.addChild(column);
        }
        
        if ( coach.is(/\s*,/) ) {
            coach.skipSpace();
            coach.expect(",");
            coach.skipSpace();
            
            this.parseBody(coach);
        }
    }
    
    is(coach) {
        return coach.isWord("extention");
    }
    
    clone() {
        let clone = new Extention();
        
        clone.name = this.name.clone();
        clone.addChild(this.name);
        
        clone.table = this.table.clone();
        clone.addChild(this.table);
        
        clone.columns = {};
        clone.columnsArr = [];
        clone.constraints = [];
        
        this.columnsArr.forEach(column => {
            column = column.clone();
            let key = column.name.toLowerCase();
            
            clone.columns[ key ] = column;
            clone.columnsArr.push( column );
            clone.addChild(column);
        });
        
        this.constraints.forEach(constraint => {
            constraint = constraint.clone();
            clone.constraints.push(constraint);
            clone.addChild(constraint);
        });
        
        return clone;
    }
    
    toString() {
        let out = "extention ";
        out += this.name.toString();
        
        out += " for ";
        out += this.table.toString();
        
        out += " ( ";
        let items = this.columnsArr.concat( this.constraints );
        out += items.map(item => item.toString()).join(", ");
        out += " )";
        
        return out;
    }
}

module.exports = Extention;
