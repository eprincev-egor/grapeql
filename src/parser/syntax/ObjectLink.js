"use strict";

const Syntax = require("./Syntax");

class ObjectLink extends Syntax {
    parse(coach, options) {
        options = options || {posibleStar: false};
        this.link = [];
        
        this.parseLink(coach, options);
    }
    
    parseLink(coach, options) {
        if ( options.posibleStar && coach.is("*") ) {
            this.link.push( "*" );
            coach.i++;
        } else {
            let elem = coach.parseObjectName();
            this.link.push( elem.name );
        }
        
        if ( coach.is(/\s*\./) ) {
            coach.skipSpace();
            coach.i++; // .
            coach.skipSpace();
            
            this.parseLink( coach, options );
        }
    }
    
    is(coach) {
        return coach.isDoubleQuotes() || coach.isWord();
    }
    
    isStar() {
        return this.link.some(elem => elem == "*");
    }
    
    getLast() {
        return this.link[ this.link.length - 1 ];
    }
}

module.exports = ObjectLink;
