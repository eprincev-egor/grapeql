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
            this.addChild( elem );
            this.link.push( elem );
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

    clone() {
        let clone = new ObjectLink();

        clone.link = this.link.map(elem => {
            if ( elem == "*" ) {
                return "*";
            }

            let elemClone = elem.clone();
            clone.addChild(elemClone);
            return elemClone;
        });

        return clone;
    }

    toString() {
        return this.link.map(elem => {
            if ( elem == "*" ) {
                return "*";
            }

            return elem.toString();
        }).join(".");
    }

    getType(params) {
        let Select = this.Coach.Select;
        let select = this.findParent(parent => parent instanceof Select);

        if ( !select ) {
            throw new Error("ObjectLink must be inside Select");
        }

        let source = select.getColumnSource(params, this);
        if ( source.expression ) {
            return source.expression.getType(params);
        } else {
            let dbColumn = source.dbColumn;
            return dbColumn.type;
        }
    }

    add(name) {
        if ( !this.link ) {
            this.link = [];
        }

        this.addChild(name);
        this.link.push(name);
    }

    shift() {
        if ( !this.link || !this.link.length ) {
            return;
        }

        let elem = this.link.shift();

        let index = this.childern.indexOf(elem);
        if ( index != -1 ) {
            this.childern.splice(index, 1);
        }

        return elem;
    }

    unshift(elem) {
        this.link.unshift(elem);
        this.addChild(elem);
    }
}

module.exports = ObjectLink;
