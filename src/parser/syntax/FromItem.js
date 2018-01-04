"use strict";

const Syntax = require("./Syntax");
const tests = require("./FromItem.tests");

class FromItem extends Syntax {
    parse(coach) {
        // [ LATERAL ] ( select ) [ AS ] alias 
        if ( coach.is("(") || coach.is(/lateral\s*\(/i) ) {
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
}

FromItem.tests = tests;

module.exports = FromItem;
