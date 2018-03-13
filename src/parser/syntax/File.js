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
                let elem = new this.Coach.FilePathElement();
                elem.name = ".";
                this.path.push(elem);
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
            elem = coach.parseFilePathElement();
            
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
        clone.path = this.path.map(elem => elem.clone());
        return clone;
    }
    
    toString() {
        let out = this.path.map(elem => {
            if ( elem.content ) {
                return elem.toString();
            }
            else {
                return elem.name;
            }
        }).join("/");
        
        if ( !/^\.+$/.test(this.path[0].name) ) {
            out = "/" + out;
        }
        
        return out;
    }
}

module.exports = File;
