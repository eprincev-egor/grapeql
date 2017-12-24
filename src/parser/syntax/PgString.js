"use strict";

const Syntax = require("../syntax/Syntax");

class PgString extends Syntax {
    parse(coach) {
        if ( coach.is(/[xb]/i) ) {
            this.parseByteString(coach);
            return;
        }
        
        if ( coach.is("$") ) {
            this.parseDollarString(coach);
            return;
        }
        
        let withEscape = false,
            withUEsacape = false;
        
        if ( coach.is(/e/i) ) {
            withEscape = true;
            coach.i++;
        }
        else if ( coach.is(/u&/i) ) {
            withUEsacape = true;
            coach.i += 2;
        }
        
        let value = this.readSingleQuotes( coach, withEscape );
        
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
    
    parseDollarString(coach) {
        let tag = "";
        
        coach.expectRead("$");
        if ( coach.is(/\w/) ) {
            tag = coach.readCurrentWord();
        }
        coach.expectRead("$");
        
        let value = "";
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( symb == "$" ) {
                let close = coach.str.slice( coach.i, coach.i + tag.length + 2 );
                
                if ( close == "$" + tag + "$" ) {
                    coach.i += tag.length + 2;
                    break;
                }
            }
            
            value += symb;
        }
        
        this.value = value;
    }
    
    parseByteString(coach) {
        if ( coach.is(/b/i) ) {
            coach.i++;
            let value = this.readSingleQuotes(coach, false);
            
            if ( !/^[01]*$/.test(value) ) {
                coach.throwError("byte string b'' must contain only 0 or 1");
            }
            
            this.value = value;
        }
        
        else if ( coach.is(/x/i) ) {
            coach.i++;
            let value = this.readSingleQuotes(coach, false);
            
            if ( !/^[\dabcdef]*$/.test(value) ) {
                coach.throwError("byte string x'' must contain only digits or abcdef");
            }
            
            this.value = value.split("").map(x => parseInt(x, 16).toString(2)).join("");
        }
    }
    
    readSingleQuotes(coach, withEscape) {
        coach.expectRead("'");
        let value = "";
        
        for (; coach.i < coach.n; coach.i++) {
            let symb = coach.str[ coach.i ];
            
            if ( symb == "\\" && withEscape ) {
                value += this.readEscape(coach);
                coach.i--;
                continue;
            }
            
            if ( symb == "'" ) {
                if ( coach.str[ coach.i + 1 ] == "'" ) {
                    value += "'";
                    coach.i++;
                    continue;
                }
                
                coach.i++;
                break;
            }
            
            value += symb;
        }
        
        if ( coach.is(/\s*[\n\r]/) ) {
            coach.skipSpace();
            value += this.readSingleQuotes( coach );
        }
        
        return value;
    }
    
    readEscape(coach) {
        coach.i++;
        let symb = coach.str[ coach.i ];
        
        if ( 
            symb == "\\" ||
            symb == "b" ||
            symb == "f" ||
            symb == "n" ||
            symb == "r" ||
            symb == "t"
        ) {
            coach.i++;
            return eval("'\\" + symb + "'");
        }
        else if ( symb == "x" ) {
            let h1 = coach.str[ coach.i + 1 ];
            let h2 = coach.str[ coach.i + 2 ];
            
            if( !/[\dabcdef]/.test(h1) ) {
                coach.throwError("invalid unicode sequence");
            }
            
            if ( /[\dabcdef]/.test(h2) ) {
                coach.i += 2;
                symb = h1 + h2;
            } else {
                coach.i++;
                symb = h1;
            }
            
            symb = coach.parseUnicode(symb);
            return symb;
        }
        else if ( symb == "u" ) {
            symb = coach.str.slice(coach.i + 1, coach.i + 5);
            symb = coach.parseUnicode(symb);
            coach.i += 5;
            return symb;
        }
        else if ( symb == "U" ) {
            symb = coach.str.slice(coach.i + 1, coach.i + 7);
            symb = coach.parseUnicode(symb);
            coach.i += 7;
            return symb;
        }
        else if ( /[01234567]/.test(symb) ) {
            coach.i++;
            
            if ( /[01234567]/.test(coach.str[ coach.i ]) ) {
                symb += coach.str[ coach.i ];
                coach.i++;
            }
            if ( /[01234567]/.test(coach.str[ coach.i ]) ) {
                symb += coach.str[ coach.i ];
                coach.i++;
            }
            
            symb = parseInt( symb, 8 );
            symb = symb.toString(16);
            symb = coach.parseUnicode(symb);
            
            return symb;
        }
        
        return symb;
    }
    
    is(coach, str) {
        return (
            str[0] == "'" || 
            
            (str[0] == "e" || str[0] == "E") &&
            str[1] == "'" ||
            
            (str[0] == "u" || str[0] == "U") &&
            str[1] == "&" &&
            str[2] == "'" ||
            
            (str[0] == "b" || str[0] == "B") &&
            str[1] == "'" ||
            
            (str[0] == "x" || str[0] == "X") &&
            str[1] == "'" ||
            
            coach.is(/\$\w*\$/)
        );
    }
}

PgString.tests = [
    {
        str: "'hello ''world'''",
        result: {value: "hello 'world'"}
    },
    {
        str: "'hello'\n'world'",
        result: {value: "helloworld"}
    },
    {
        str: "'hello'\r'world'",
        result: {value: "helloworld"}
    },
    {
        str: "'hello'\n\r'world'",
        result: {value: "helloworld"}
    },
    {
        str: "'hello' \n\r 'world' \n\r 'world'",
        result: {value: "helloworldworld"}
    },
    {
        str: "E'\\\\'",
        result: {value: "\\"}
    },
    {
        str: "E'\\n'",
        result: {value: "\n"}
    },
    {
        str: "E'\\r'",
        result: {value: "\r"}
    },
    {
        str: "E'\\b'",
        result: {value: "\b"}
    },
    {
        str: "E'\\f'",
        result: {value: "\f"}
    },
    {
        str: "E'\\t'",
        result: {value: "\t"}
    },
    {
        str: "E'\\U000061b'",
        result: {value: "ab"}
    },
    {
        str: "E'\\U00006aa'",
        result: {value: "ja"}
    },
    {
        str: "E'\\U00006A'",
        result: {value: "j"}
    },
    {
        str: "E'\\u0061'",
        result: {value: "a"}
    },
    {
        str: "E'\\061a'",
        result: {value: "1a"}
    },
    {
        str: "U&'d\\0061t\\+000061 test'",
        result: {value: "data test"}
    },
    {
        str: "u&'d\\0061t\\+000061 test'",
        result: {value: "data test"}
    },
    {
        str: "U&'d!0061t!+000061' UESCAPE '!'",
        result: {value: "data"}
    },
    {
        str: "U&'\\006'",
        error: Error
    },
    {
        str: "b'01'",
        result: {value: "01"}
    },
    {
        str: "b''",
        result: {value: ""}
    },
    {
        str: "b'01a'",
        error: Error
    },
    {
        str: "x'af'",
        result: {value: "10101111"}
    },
    {
        str: "x'a'\n'f'",
        result: {value: "10101111"}
    },
    {
        str: "x''",
        result: {value: ""}
    },
    {
        str: "x'01x'",
        error: Error
    },
    {
        str: "$$hello'world$$",
        result: {value: "hello'world"}
    },
    {
        str: "$Tag_1$hello'world$Tag_1$",
        result: {value: "hello'world"}
    },
    {
        str: "$Tag_1$$tag_1$$Tag_1$",
        result: {value: "$tag_1$"}
    },
    {
        str: "$$\n\r$$",
        result: {value: "\n\r"}
    },
    {
        str: "$q$[\\t\\r\\n\\v\\\\]$q$",
        result: {value: "[\\t\\r\\n\\v\\\\]"}
    }
];

module.exports = PgString;
