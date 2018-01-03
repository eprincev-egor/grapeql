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
}

ObjectLink.tests = [
    {
        str: "a.B.c",
        result: {
            link: [
                {word: "a"},
                {word: "b"},
                {word: "c"}
            ]
        }
    },
    {
        str: `"Nice"
        .
        "test"   . X.y."some"
        `,
        result: {
            link: [
                {content: "Nice"},
                {content: "test"},
                {word: "x"},
                {word: "y"},
                {content: "some"}
            ]
        }
    }
];

module.exports = ObjectLink;
