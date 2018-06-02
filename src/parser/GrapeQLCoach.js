"use strict";

const Coach = require("./Coach");

class GrapeQLCoach extends Coach {
    replaceComments() {
        let coach = this,
            startIndex = coach.i,
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

        coach.i = startIndex;
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
GrapeQLCoach.addSyntax("In", require("./syntax/In"));
GrapeQLCoach.addSyntax("Between", require("./syntax/Between"));
GrapeQLCoach.addSyntax("DataType", require("./syntax/DataType"));
GrapeQLCoach.addSyntax("Cast", require("./syntax/Cast"));
GrapeQLCoach.addSyntax("ToType", require("./syntax/ToType"));
GrapeQLCoach.addSyntax("CaseWhenElement", require("./syntax/CaseWhenElement"));
GrapeQLCoach.addSyntax("CaseWhen", require("./syntax/CaseWhen"));
GrapeQLCoach.addSyntax("ObjectName", require("./syntax/ObjectName"));
GrapeQLCoach.addSyntax("ObjectLink", require("./syntax/ObjectLink"));
GrapeQLCoach.addSyntax("FunctionCall", require("./syntax/FunctionCall"));
GrapeQLCoach.addSyntax("Expression", require("./syntax/Expression"));
GrapeQLCoach.addSyntax("Column", require("./syntax/Column"));
GrapeQLCoach.addSyntax("FromItem", require("./syntax/FromItem"));
GrapeQLCoach.addSyntax("GroupByElement", require("./syntax/GroupByElement"));
GrapeQLCoach.addSyntax("OrderByElement", require("./syntax/OrderByElement"));
GrapeQLCoach.addSyntax("Join", require("./syntax/Join"));
GrapeQLCoach.addSyntax("FilePathElement", require("./syntax/FilePathElement"));
GrapeQLCoach.addSyntax("File", require("./syntax/File"));
GrapeQLCoach.addSyntax("Select", require("./syntax/Select/Select"));
GrapeQLCoach.addSyntax("WithQuery", require("./syntax/WithQuery"));
GrapeQLCoach.addSyntax("WindowDefinition", require("./syntax/WindowDefinition"));
GrapeQLCoach.addSyntax("WindowItem", require("./syntax/WindowItem"));
GrapeQLCoach.addSyntax("CreateCacheReverseExpression", require("./syntax/CreateCacheReverseExpression"));
GrapeQLCoach.addSyntax("CacheFor", require("./syntax/CacheFor"));

GrapeQLCoach.parseEntity = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseSelect();
};

// need for tests
if ( typeof window !== "undefined" ) {
    window.GrapeQLCoach = GrapeQLCoach;
}

module.exports = GrapeQLCoach;
