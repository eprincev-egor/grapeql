"use strict";

const Coach = require("./Coach");

class GrapeQLCoach extends Coach {
    replaceComments() {
        let coach = this,
            newStr = coach.str.split("");
        
        for (; coach.i < coach.n; coach.i++) {
            let i = coach.i;
            
            if ( coach.isComment() ) {
                coach.parseComment();
                
                let length = coach.i - i;
                // safe \n\r
                let spaceStr = coach.str.slice(i, i + length).replace(/[^\n\r]/g, " ");
                
                newStr.splice.apply(newStr, [i, length].concat( spaceStr.split("") ));
            }
        }
        
        coach.str = newStr.join("");
    }
}

GrapeQLCoach.addSyntax = Coach.addSyntax;

GrapeQLCoach.addSyntax("Comment", require("./syntax/Comment"));
GrapeQLCoach.addSyntax("Operator", require("./syntax/Operator"));
GrapeQLCoach.addSyntax("PgNull", require("./syntax/PgNull"));
GrapeQLCoach.addSyntax("Boolean", require("./syntax/Boolean"));
GrapeQLCoach.addSyntax("SystemVariable", require("./syntax/SystemVariable"));
GrapeQLCoach.addSyntax("PgNumber", require("./syntax/PgNumber"));
GrapeQLCoach.addSyntax("DoubleQuotes", require("./syntax/DoubleQuotes"));
GrapeQLCoach.addSyntax("PgString", require("./syntax/PgString"));
GrapeQLCoach.addSyntax("DataType", require("./syntax/DataType"));
GrapeQLCoach.addSyntax("Cast", require("./syntax/Cast"));
GrapeQLCoach.addSyntax("ToType", require("./syntax/ToType"));
GrapeQLCoach.addSyntax("CaseWhenElement", require("./syntax/CaseWhenElement"));
GrapeQLCoach.addSyntax("CaseWhen", require("./syntax/CaseWhen"));
GrapeQLCoach.addSyntax("ObjectName", require("./syntax/ObjectName"));
GrapeQLCoach.addSyntax("ObjectLink", require("./syntax/ObjectLink"));
GrapeQLCoach.addSyntax("FunctionCall", require("./syntax/FunctionCall"));
GrapeQLCoach.addSyntax("Expression", require("./syntax/Expression"));
GrapeQLCoach.addSyntax("As", require("./syntax/As"));
GrapeQLCoach.addSyntax("Column", require("./syntax/Column"));
GrapeQLCoach.addSyntax("FromItem", require("./syntax/FromItem"));
GrapeQLCoach.addSyntax("Select", require("./syntax/Select"));
GrapeQLCoach.addSyntax("WithQuery", require("./syntax/WithQuery"));

// need for tests
if ( typeof window !== "undefined" ) {
    window.GrapeQLCoach = GrapeQLCoach;
}

module.exports = GrapeQLCoach;