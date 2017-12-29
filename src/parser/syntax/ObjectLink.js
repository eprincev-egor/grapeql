"use strict";

const Syntax = require("../syntax/Syntax");

class ObjectLink extends Syntax {
    parse(coach) {
        this.link = [];
        
        this.parseLink(coach);
    }
    
    parseLink(coach) {
        let elem;
        
        if ( coach.isDoubleQuotes() ) {
            elem = coach.parseDoubleQuotes();
        }
        else {
            elem = {word: coach.expectWord()};
        }
        
        this.link.push(elem);
        
        if ( coach.is(/\s*\./) ) {
            coach.skipSpace();
            coach.i++; // .
            coach.skipSpace();
            
            this.parseLink( coach );
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
