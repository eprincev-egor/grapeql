"use strict";

const DoubleQuotes = require("./DoubleQuotes");

class FilePathElement extends DoubleQuotes {
    parse(coach) {
        if ( coach.isDoubleQuotes() ) {
            super.parse(coach);
        }
        else {
            this.name = coach.read(/[^\s/]+/);
        }
    }

    is(coach) {
        return coach.is(/[^\s/]/);
    }

    clone() {
        let clone = new FilePathElement();
        this.fillClone( clone );
        return clone;
    }

    fillClone(clone) {
        if ( this.name ) {
            clone.name = this.name;
        } else {
            super.fillClone( clone );
        }
    }

    toString() {
        if ( this.name ) {
            return this.name;
        } else {
            return super.toString();
        }
    }

    toObjectName() {
        let object = new this.Coach.ObjectName();

        if ( this.name ) {
            let name = this.name.replace(/\.sql$/i, "");

            if ( /^\w+$/i.test(name) ) {
                object.word = name;
            } else {
                object.content = name;
            }
        } else {
            super.fillClone(object);
        }

        return object;
    }

    toAs() {
        let as = new this.Coach.ObjectLink();
        as.add( this.toObjectName() );
        return as;
    }

    equal(anotherObject) {
        if ( this.name && anotherObject.name ) {
            return this.name == anotherObject.name;
        }
        else if ( this.name && anotherObject.content ) {
            return this.name == anotherObject.content;
        }
        else if ( this.content && anotherObject.name ) {
            return this.content == anotherObject.name;
        }
        else {
            return this.content = anotherObject.content;
        }
    }

    equalString(string) {
        if ( this.name ) {
            return this.name == string;
        } else {
            return this.content == string;
        }
    }
}

module.exports = FilePathElement;
