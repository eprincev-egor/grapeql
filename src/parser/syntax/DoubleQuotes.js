"use strict";

const Syntax = require("../syntax/Syntax");

class DoubleQuotes extends Syntax {
    parse(coach) {
        let value = "",
            withUEsacape = false;
        
        if ( coach.is("\"") ) {
            coach.i++;
        } else {
            coach.expectWord("u");
            coach.expectRead("&\"");
            withUEsacape = true;
        }
        
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[coach.i];
            
            if ( symb == "\"" ) {
                if ( coach.str[coach.i + 1] == "\"" ) {
                    coach.i++;
                    value += "\"";
                    continue;
                }
                coach.i++;
                break;
            }
            
            value += symb;
        }
        
        let escape = "\\";
        if ( coach.is(/\s*uescape/i) ) {
            if ( !withUEsacape ) {
                coach.throwError("unexpected uescape, use u& before double quotes  ");
            }
            
            coach.skipSpace();
            coach.expectWord("uescape");
            coach.skipSpace();
            
            coach.expectRead("'");
            escape = coach.str[ coach.i ];
            
            if ( /[+-\s\dabcdef"']/.test(escape) ) {
                coach.throwError("The escape character can be any single character other than a hexadecimal digit, the plus sign, a single quote, a double quote, or a whitespace character");
            }
            coach.i++;
            coach.expectRead("'");
        }
        
        if ( withUEsacape ) {
            for (let i = 0, n = value.length; i < n; i++) {
                let symb = value[i],
                    length;
                
                if ( symb == escape ) {
                    let expr;
                    if ( value[i + 1] == "+" ) {
                        length = 8;
                        expr = value.slice(i + 2, i + length);
                    } else {
                        length = 5;
                        expr = value.slice(i + 1, i + length);
                    }
                    
                    expr = coach.parseUnicode(expr);
                    n -= (length - 1);
                    value = value.slice(0, i) + expr + value.slice(i + length);
                }
            }
        }
        
        this.value = value;
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
}

DoubleQuotes.tests = [
    {
        str: "\"test\"",
        result: {value: "test"}
    },
    {
        str: "\"test\"\"\"",
        result: {value: "test\""}
    },
    {
        str: "U&\"d\\0061t\\+000061 test\"",
        result: {value: "data test"}
    },
    {
        str: "u&\"d\\0061t\\+000061 test\"",
        result: {value: "data test"}
    },
    {
        str: "U&\"d!0061t!+000061\" UESCAPE '!'",
        result: {value: "data"}
    },
    {
        str: "U&\"\\006\"",
        error: Error
    },
    {
        str: "U&\"\\006ф\"",
        error: Error
    },
    {
        str: "\"\" uescape '!'",
        error: Error
    },
    {
        str: "u&\"\" uescape '+'",
        error: Error
    },
    {
        str: "u&\"\" uescape '-'",
        error: Error
    },
    {
        str: "u&\"\" uescape '''",
        error: Error
    },
    {
        str: "u&\"\" uescape '\"'",
        error: Error
    },
    {
        str: "u&\"\" uescape ' '",
        error: Error
    },
    {
        str: "u&\"\" uescape '\n'",
        error: Error
    },
    {
        str: "u&\"\" uescape '\t'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'a'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'b'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'c'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'd'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'e'",
        error: Error
    },
    {
        str: "u&\"\" uescape 'f'",
        error: Error
    },
    {
        str: "u&\"\" uescape '0'",
        error: Error
    },
    {
        str: "u&\"\" uescape '9'",
        error: Error
    }
];

module.exports = DoubleQuotes;
