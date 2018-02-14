"use strict";

const Syntax = require("./Syntax");

class FromItem extends Syntax {
    parse(coach) {
        // file Order.sql
        if ( coach.isFile() ) {
            this.file = coach.parseFile();
            this.addChild(this.file);
            coach.skipSpace();
            
            let i = coach.i;
            let as = coach.parseAs();
            if ( !as.alias ) {
                coach.i = i;
                
                coach.throwError("expected alias");
            }
            this.as = as;
            this.addChild(this.as);
        }
        // [ LATERAL ] ( select ) [ AS ] alias 
        else if ( coach.is("(") || coach.is(/lateral\s*\(/i) ) {
            let isLateral = false;
            if ( coach.isWord("lateral") ) {
                isLateral = true;
                coach.readWord(); // lateral
                coach.skipSpace();
            }
            
            coach.i++; // (
            coach.skipSpace();
            
            this.lateral = isLateral;
            this.select = coach.parseSelect();
            this.addChild(this.select);
            
            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
            
            let i = coach.i;
            let as = coach.parseAs();
            if ( !as.alias ) {
                coach.i = i;
                
                coach.throwError("expected alias");
            }
            this.as = as;
            this.addChild(this.as);
        } 
        // [ LATERAL ] function_name ( [ argument [, ...] ] )
        //            [ WITH ORDINALITY ] [ [ AS ] alias ]
        else if ( this.isFromFunctionCall(coach) ) {
            let isLateral = false;
            if ( coach.isWord("lateral") ) {
                isLateral = true;
                coach.readWord(); // lateral
                coach.skipSpace();
            }
            
            this.lateral = isLateral;
            this.withOrdinality = false;
            this.functionCall = coach.parseFunctionCall();
            this.addChild(this.functionCall);
            
            coach.skipSpace();
            
            if ( coach.isWord("with") ) {
                coach.expect(/with\s+ordinality\s+/i);
                this.withOrdinality = true;
            }
            
            this.as = coach.parseAs();
            this.addChild(this.as);
        }
        // [ ONLY ] table_name [ * ] [ [ AS ] alias 
        else {
            let isOnly = false;
            if ( coach.isWord("only") ) {
                isOnly = true;
                coach.readWord(); // only
                coach.skipSpace();
            }
            
            this.only = isOnly;
            this.table =  coach.parseObjectLink();
            this.addChild(this.table);
            
            coach.skipSpace();
            
            if ( coach.is("*") ) {
                coach.i++; // *
                coach.skipSpace();
            }
            
            this.as = coach.parseAs();
            this.addChild(this.as);
        }
        
        // [ ( column_alias [, ...] ) ]
        if ( coach.is(/\s*\(/) ) {
            coach.skipSpace();
            coach.i++; // (
            coach.skipSpace();
            
            this.columns = coach.parseComma("ObjectName")
                .map(objectName => objectName.name);
            coach.skipSpace();
            
            coach.expect(")");
        }
    }
    
    isFromFunctionCall(coach) {
        let i = coach.i;
        
        if ( coach.isWord("lateral") ) {
            coach.readWord();
            coach.skipSpace();
        }
        let isFunctionCall = coach.isFunctionCall();
        
        coach.i = i;
        return isFunctionCall;
    }
    
    is(coach) {
        return coach.is(/only|lateral|\(/) || coach.isWord();
    }
    
    clone() {
        let clone = new FromItem();
        
        if ( this.file ) {
            clone.file = this.file.clone();
            clone.addChild(clone.file);
        }
        else if ( this.select ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }
            clone.select = this.select.clone();
            clone.addChild(clone.select);
        }
        else if ( this.functionCall ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }
            
            clone.functionCall = this.functionCall.clone();
            clone.addChild(clone.functionCall);
            
            if ( this.withOrdinality ) {
                clone.withOrdinality = true;
            }
        }
        else if ( this.table ) {
            if ( this.only ) {
                clone.only = true;
            }
            
            clone.table = this.table.clone();
            clone.addChild(clone.table);
        }
        
        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }
        
        if ( this.columns ) {
            clone.columns = this.columns.map(name => name.clone());
        }
        
        return clone;
    }
    
    toString() {
        let out = "";
        
        if ( this.file ) {
            this.file.toString();
        }
        else if ( this.select ) {
            if ( this.lateral ) {
                out += "lateral ";
            }
            out += "(";
            out += this.select.toString();
            out += ")";
        }
        else if ( this.functionCall ) {
            if ( this.lateral ) {
                out += "lateral ";
            }
            
            out += this.functionCall.toString();
            
            if ( this.withOrdinality ) {
                out += " with ordinality";
            }
        }
        else if ( this.table ) {
            if ( this.only ) {
                out += "only ";
            }
            
            out += this.table.toString();
        }
        
        if ( this.as ) {
            out += " ";
            out += this.as.toString();
        }
        
        if ( this.columns ) {
            out += " (";
            out += this.columns.map(name => name.toString()).join(", ");
            out += ")";
        }
        
        return out;
    }
}

module.exports = FromItem;
