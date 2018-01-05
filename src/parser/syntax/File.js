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
            
            if ( !coach.is("/") ) {
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
}

File.tests = [
    {
        str: "file Order",
        result: {
            path: [
                {name: "."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "./Order",
        result: {
            path: [
                {name: "."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "../Order",
        result: {
            path: [
                {name: ".."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "file Order.sql",
        result: {
            path: [
                {name: "."},
                {name: "Order.sql"}
            ]
        }
    },
    {
        str: "file \" nice \"",
        result: {
            path: [
                {name: "."},
                {content: " nice "}
            ]
        }
    },
    {
        str: "file some / file on",
        result: {
            path: [
                {name: "."},
                {name: "some"},
                {name: "file"}
            ]
        }
    },
    {
        str: "file /root.sql",
        result: {
            path: [
                {name: "root.sql"}
            ]
        }
    },
    {
        str: "/root.sql",
        result: {
            path: [
                {name: "root.sql"}
            ]
        }
    }
];

module.exports = File;
