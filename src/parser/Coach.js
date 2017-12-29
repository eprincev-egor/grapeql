"use strict";

class Coach {
    constructor(str) {
        this.str = str;
        this.n = str.length;
        this.i = 0;
    }

    throwError(message, index) {
        let position = this.getPosition(index);
            
        throw new Error(
            "\n SyntaxError at line " + (position.line + 1) + 
                ", position " + (position.column + 1) + 
                ", at near `" + this.str.slice(Math.max(position.index, 0), position.index + 10) + "`" + 
                "\n Message: " + message
        );
    }
    
    skipSpace() {
        for (; this.i < this.n; this.i++) {
            let symb = this.str[ this.i ];
            
            if ( !/\s/.test(symb) ) {
                break;
            }
        }
    }

    expectWord(word) {
        let currentWord = this.readCurrentWord().toLowerCase();
        
        if ( word == null ) {
            if ( !currentWord ) {
                this.throwError("expected any word");
            }
            return currentWord;
        }
        
        if ( currentWord == word ) {
            return currentWord;
        }
        
        this.throwError("expected word: " + word);
    }
    
    expect(str) {
        if ( this.str.slice(this.i).indexOf(str) === 0 ) {
            this.i += str.length;
        } else {
            this.throwError("expected: " + str);
        }
    }
    
    readCurrentWord() {
        let word = "";
        
        for (; this.i < this.n; this.i++) {
            let symb = this.str[ this.i ];
            
            if ( /[^\w]/.test(symb) ) {
                break;
            }
            
            word += symb;
        }
        
        return word;
    }
    
    read(regExp) {
        var str = this.str.slice(this.i),
            execResult = regExp.exec(str);
        
        if ( !execResult || execResult.index !== 0 ) {
            return "";
        }
        
        this.i += execResult[0].length;
        return execResult[0];
    }
    
    parseUnicode(unicode) {
        try {
            // unicode can be valid js code
            if ( !/^[\dabcdef]+$/i.test(unicode) ) {
                throw new Error();
            }
            
            unicode = eval("'\\u{" + unicode + "}'");
        } catch(err) {
            this.throwError("invalid unicode sequence: " + unicode);
        }
        
        return unicode;
    }
    
    isWord(word) {
        if ( word == null ) {
            return this.is(/\w/);
        }
        
        let i = this.i;
        let currentWord = this.readCurrentWord();
        this.i = i;
        
        return currentWord.toLowerCase() == word;
    }
    
    // проверяем строку (от текущего места) на регулярное выражение
    is(regExp) {
        let str = this.str.slice(this.i);
        
        if ( 
            typeof regExp === "function" && 
            typeof regExp.prototype.is === "function" 
        ) {
            return new regExp().is(this, str);
        } 
        
        else if ( typeof regExp === "string" ) {
            return str.indexOf(regExp) === 0;
        }
        
        else {
            return str.search(regExp) === 0;
        }
    }
    
    // Expression or ObjectLink or any SyntaxName,
    // first symbol must be in upper case
    parseComma(SyntaxName) {
        let parseSyntax = this[ "parse" + SyntaxName ].bind(this),
            isSyntax = this[ "is" + SyntaxName ].bind(this),
            elements = [];
        
        this._parseComma(isSyntax, parseSyntax, elements);
        
        return elements;
    }
    
    _parseComma(isSyntax, parseSyntax, elements) {
        let elem;
        
        if ( isSyntax() ) {
            elem = parseSyntax();
            elements.push( elem );
            
            if ( this.is(/\s*,/) ) {
                this.skipSpace();
                this.i++; // ,
                this.skipSpace();
                
                this._parseComma(isSyntax, parseSyntax, elements);
            }
        }
        
        return elements;
    }
        
    getPosition(index) {
        let position = +index === +index ? +index : this.i, // index type maybe string or number, but not NaN
            lines = this.str.slice(0, position).split("\n"),
            lineNumber = lines.length,
            currentLine = lines.pop(),
            column = position - lines.join("\n").length - (currentLine.length - currentLine.replace(/^[\n\r]+/, "").length); // POP!
            
        return {
            index: position,
            line: lineNumber - 1,
            column: column - 1
        };
    }
}

Coach.addSyntax = function(className, SyntaxClass) {
    let ChildCoach = this;
    
    ChildCoach[ className ] = SyntaxClass;
    SyntaxClass.prototype.Coach = ChildCoach;
    
    let funcName;
    
    if ( SyntaxClass.prototype.is ) {
        funcName = "is" + className;
        ChildCoach.prototype[funcName] = function isSyntax() {
            return this.is(SyntaxClass);
        };
    }
    
    funcName = "parse" + className;
    ChildCoach.prototype[funcName] = function parseSyntax() {
        let syntax = new SyntaxClass();
        let args = [this].concat([].slice.call(arguments));
        syntax.parse.apply(syntax, args);
        return syntax; 
    };
};

module.exports = Coach;
