"use strict";

const Syntax = require("./Syntax");

// WITH [ RECURSIVE ] with_query [, ...]

class With extends Syntax {
    constructor(fromString) {
        super();
        this.queries = {};
        this.queriesArr = [];

        if ( typeof fromString === "string" ) {
            fromString = fromString.trim();
            let coach = new this.Coach(fromString);
            this.parse(coach);
        }
    }

    parse(coach) {
        coach.expectWord("with");
        coach.skipSpace();

        if ( coach.isWord("recursive") ) {
            coach.expectWord("recursive");
            coach.skipSpace();
            this.recursive = true;
        }

        this.queries = {};
        this.queriesArr = coach.parseComma("WithQuery");

        if ( !this.queriesArr.length ) {
            coach.throwError("expected with_query");
        }

        this.queriesArr.forEach(query => {
            let name = query.name.toLowerCase();
            if ( name in this.queries ) {
                throw new Error(`WITH query name "${ name }" specified more than once`);
            }

            this.queries[ name ] = query;

            this.addChild(query);
        });
    }

    is(coach) {
        return coach.isWord("with");
    }

    isEmpty() {
        return this.queriesArr.length === 0;
    }

    clone() {
        let clone = new With();

        if ( this.recursive ) {
            clone.recursive = true;
        }

        clone.queries = {};
        clone.queriesArr = [];

        this.queriesArr.forEach(query => {
            let key = query.name.toLowerCase();
            let queryClone = query.clone();

            clone.queries[ key ] = queryClone;
            clone.queriesArr.push( queryClone );

            clone.addChild(queryClone);
        });

        return clone;
    }

    toString() {
        let sql = "with ";

        if ( this.recursive ) {
            sql += "recursive ";
        }

        this.queriesArr.forEach((query, i) => {
            if ( i > 0 ) {
                sql += ", ";
            }
            sql += query.toString();
        });

        return sql;
    }
    
    setWithQuery(name, sql) {
        let withQuery = new this.Coach.WithQuery(`${name} as (${ sql })`);
        let key = withQuery.name.toLowerCase();
        
        this.queriesArr.push(withQuery);
        this.queries[ key ] = withQuery;
        this.addChild(withQuery);
    }
}

module.exports = With;
