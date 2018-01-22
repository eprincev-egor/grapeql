"use strict";

const Syntax = require("./Syntax");

class File extends Syntax {
    parse(coach) {
        this.path = [];
        
        if ( coach.is(/\.*\//) ) {
            this.parsePath(coach, {first: true});
        } else {
            coach.expectWord("file");
            coach.skipSpace();
            
            if ( !coach.is("/") && !coach.is(".") ) {
                this.path.push({name: "."});
            }
            
            this.parsePath(coach, {first: true});
        }
    }
    
    parsePath(coach, options) {
        let elem;
        
        if ( coach.isDoubleQuotes() ) {
            elem = coach.parseDoubleQuotes();
            this.path.push(elem);
        } else {
            elem = {name: coach.read(/[^\s/]+/)};
            
            if ( !elem.name ) {
                if ( options.first !== true ) {
                    coach.throwError("expected file name");
                }
            } else {
                this.path.push(elem);
            }
        }
        
        if ( coach.is(/\s*\//) ) {
            coach.skipSpace();
            coach.read(/\/+/);
            coach.skipSpace();
            
            this.parsePath(coach, {first: false});
        }
    }
    
    is(coach) {
        return coach.is(/\.*\//) || coach.isWord("file");
    }
    
    clone() {
        let clone = new File();
        
        clone.path = this.path.map(elem => {
            if ( elem.name ) {
                return {name: elem.name};
            }
            
            return elem.clone();
        });
        
        return clone;
    }
    
    toString() {
        return this.path.map(elem => {
            if ( elem.name ) {
                return elem.name;
            }
            
            return elem.toString();
        }).join("/");
    }
}

module.exports = File;
