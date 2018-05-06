"use strict";

const Syntax = require("./Syntax");

class File extends Syntax {
    parse(coach) {
        this.path = [];

        if ( !coach.is(/\.*\//) ) {
            coach.expectWord("file");
            coach.skipSpace();
        }

        if ( !coach.is("/") && !coach.is(".") ) {
            let elem = new this.Coach.FilePathElement();
            elem.name = ".";
            this.path.push(elem);
        }

        if ( coach.is("/") ) {
            coach.i++;
        }

        let oldLength = this.path.length;
        this.parsePath(coach);

        if ( this.path.length == oldLength ) {
            coach.throwError("expected file name");
        }
    }

    parsePath(coach) {
        let elem = coach.parseFilePathElement();
        this.path.push(elem);

        if ( coach.is(/\s*\//) ) {
            coach.skipSpace();
            coach.read(/\/+/);
            coach.skipSpace();

            this.parsePath(coach);
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
        let out = this.path.map(elem => elem.toString()).join("/");

        if ( !/^\.+$/.test(this.path[0].name) ) {
            out = "/" + out;
        }

        return out;
    }

    toObjectName() {
        let last = this.path.slice(-1)[0];
        return last.toObjectName();
    }

    toAs() {
        let last = this.path.slice(-1)[0];
        return last.toAs();
    }

    equalAlias(alias) {
        let last = this.path.slice(-1)[0];
        if ( last ) {
            if ( last.content ) {
                return last.content == alias;
            }
            else if ( last.name ) {
                return last.name.toLowerCase() == alias.toLowerCase();
            }
        }
    }
}

module.exports = File;
