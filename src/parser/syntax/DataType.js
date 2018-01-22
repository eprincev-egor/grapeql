"use strict";

const Syntax = require("./Syntax");
// TODO: load types from db
const types = [
    "smallint",
    "integer",
    "bigint",
    "decimal",
    "numeric(n)",
    "numeric(n,n)",
    "real",
    "double precision",
    "smallserial",
    "serial",
    "bigserial",
    "money",
    "character varying(n)",
    "varchar(n)",
    "character(n)",
    "char(n)",
    "text",
    "\"char\"",
    "name",
    "bytea",
    "timestamp",
    "timestamp without time zone",
    "timestamp with time zone",
    "time without time zone",
    "time with time zone",
    // ...
    "boolean",
    "point",
    "line",
    "lseg",
    "box",
    "path",
    "polygon",
    "path",
    "circle",
    "cidr",
    "inet",
    "macaddr",
    "macaddr8",
    "bit(n)",
    "bit varying(n)",
    "tsvector",
    "tsquery",
    "uuid",
    "xml",
    "json",
    "jsonb",
    "int",
    "int4range",
    "int8range",
    "numrange",
    "tsrange",
    "tstzrange",
    "daterange",
    "regclass",
    "regproc",
    "regprocedure",
    "regoper",
    "regoperator",
    "regclass",
    "regtype",
    "regrole",
    "regnamespace",
    "regconfig",
    "regdictionary",
    "date"
];

let firstWords = {};
types.forEach(type => {
    let firstWord = type.split(" ")[0];
    firstWord = firstWord.split("(")[0];
    
    if ( !firstWords[firstWord] ) {
        firstWords[firstWord] = [];
    }
    firstWords[ firstWord ].push( type );
});

let regExps = {};
types.forEach(type => {
    let regExp = type.replace(/ /g, "\\s+");
    regExp = regExp.replace("(n)", "\\s*\\(\\s*\\d+\\s*\\)");
    regExp = regExp.replace("(n,n)", "\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*\\)");
    
    regExps[ type ] = new RegExp(regExp, "i");
});

class DataType extends Syntax {
    parse(coach) {
        if ( coach.is("\"") ) {
            coach.i++;
            coach.expectWord("char");
            coach.expect("\"");
            this.type = "\"char\"";
            return;
        }
        
        let index = coach.i;
        let word = coach.readWord().toLowerCase();
        let posibleTypes = firstWords[ word ];
        
        if ( !posibleTypes ) {
            coach.i = index;
            coach.throwError("unknown data type: " + word);
        }
        
        coach.i = index;
        for (let i = 0, n = posibleTypes.length; i < n; i++) {
            let posibleType = posibleTypes[ i ],
                regExp = regExps[ posibleType ];
            
            if ( coach.is(regExp) ) {
                this.type = regExp.exec( coach.str.slice(coach.i) )[0];
                coach.i += this.type.length;
                
                this.type = this.type.replace(/\s+/g, " ");
                this.type = this.type.replace(/\s*\(\s*/g, "(");
                this.type = this.type.replace(/\s*\)\s*/g, ")");
                this.type = this.type.replace(/\s*,\s*/g, ",");
                break;
            }
        }
        
        this.parseArrayType(coach);
    }
    
    parseArrayType(coach) {
        if ( coach.is(/\s*\[/) ) {
            coach.skipSpace();
            coach.i++;
            coach.skipSpace();
            
            if ( coach.is("]") ) {
                coach.i++;
                this.type += "[]";
            } else {
                let pgNumb = coach.parsePgNumber();
                coach.skipSpace();
                coach.expect("]");
                
                this.type += "[" + pgNumb.number + "]";
            }
        }
        
        if ( coach.is(/\s*\[/) ) {
            this.parseArrayType(coach);
        }
    }
    
    is(coach) {
        let i = coach.i;
        let word = coach.readWord().toLowerCase();
        coach.i = i;
        return word in firstWords;
    }
}

module.exports = DataType;
