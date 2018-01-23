"use strict";

const Syntax = require("./Syntax");

class DoubleQuotes extends Syntax {
    parse(coach) {
        let content = "",
            withUEsacape = false;
        
        if ( coach.is("\"") ) {
            coach.i++;
        } else {
            coach.expectWord("u");
            coach.expect("&\"");
            withUEsacape = true;
        }
        
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[coach.i];
            
            if ( symb == "\"" ) {
                if ( coach.str[coach.i + 1] == "\"" ) {
                    coach.i++;
                    content += "\"";
                    continue;
                }
                coach.i++;
                break;
            }
            
            content += symb;
        }
        
        let escape = "\\";
        if ( coach.is(/\s*uescape/i) ) {
            if ( !withUEsacape ) {
                coach.throwError("unexpected uescape, use u& before double quotes  ");
            }
            
            coach.skipSpace();
            coach.expectWord("uescape");
            coach.skipSpace();
            
            coach.expect("'");
            escape = coach.str[ coach.i ];
            
            if ( /[+-\s\dabcdef"']/.test(escape) ) {
                coach.throwError("The escape character can be any single character other than a hexadecimal digit, the plus sign, a single quote, a double quote, or a whitespace character");
            }
            coach.i++;
            coach.expect("'");
            
            this.isCustomUescape = true;
        }
        
        if ( withUEsacape ) {
            this.escape = escape;
            this.contentBeforeEscape = content;
            
            for (let i = 0, n = content.length; i < n; i++) {
                let symb = content[i],
                    length;
                
                if ( symb == escape ) {
                    let expr;
                    if ( content[i + 1] == "+" ) {
                        length = 8;
                        expr = content.slice(i + 2, i + length);
                    } else {
                        length = 5;
                        expr = content.slice(i + 1, i + length);
                    }
                    
                    expr = coach.parseUnicode(expr);
                    n -= (length - 1);
                    content = content.slice(0, i) + expr + content.slice(i + length);
                }
            }
        } else {
            this.contentBeforeEscape = content;
        }
        
        this.content = content;
    }
    
    is(coach, str) {
        return (
            str[0] == "\"" || 
            
            (str[0] == "U" || 
            str[0] == "u") &&
            str[1] == "&" &&
            str[1] == "\""
        );
    }
    
    clone() {
        let clone = new DoubleQuotes();
        clone.content = this.content;
        clone.contentBeforeEscape = this.contentBeforeEscape;
        
        clone.escape = this.escape;
        if ( this.isCustomUescape ) {
            clone.isCustomUescape = true;
        }
        
        return clone;
    }
    
    toString() {
        if ( !this.escape ) {
            let content = this.content.replace(/"/g, "\"\"");
            return "\"" + content + "\"";
        }
        
        let content = this.contentBeforeEscape;
        content = content.replace(/"/g, "\"\"");
        
        content = "u&\"" + content + "\"";
        if ( this.isCustomUescape ) {
            content += " uescape '" + this.escape + "'";
        }
        
        return content;
    }
}

module.exports = DoubleQuotes;
