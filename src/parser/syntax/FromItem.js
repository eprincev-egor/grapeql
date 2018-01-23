"use strict";

const Syntax = require("./Syntax");

class FromItem extends Syntax {
    parse(coach) {
        // file Order.sql
        if ( coach.isFile() ) {
            this.file = coach.parseFile();
            coach.skipSpace();
            
            let i = coach.i;
            let as = coach.parseAs();
            if ( !as.alias ) {
                coach.i = i;
                
                coach.throwError("expected alias");
            }
            this.as = as;
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
            
            coach.skipSpace();
            
            if ( coach.isWord("with") ) {
                coach.expect(/with\s+ordinality\s+/i);
                this.withOrdinality = true;
            }
            
            this.as = coach.parseAs();
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
            
            coach.skipSpace();
            
            if ( coach.is("*") ) {
                coach.i++; // *
                coach.skipSpace();
            }
            
            this.as = coach.parseAs();
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
        }
        else if ( this.select ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }
            clone.select = this.select.clone();
        }
        else if ( this.functionCall ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }
            
            clone.functionCall = this.functionCall.clone();
            
            if ( this.withOrdinality ) {
                clone.withOrdinality = true;
            }
        }
        else if ( this.table ) {
            if ( this.only ) {
                clone.only = true;
            }
            
            clone.table = this.table.clone();
        }
        
        if ( this.as ) {
            clone.as = this.as.clone();
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
