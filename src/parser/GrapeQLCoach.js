"use strict";

const Coach = require("./Coach");
class GrapeQLCoach extends Coach {}
GrapeQLCoach.addSyntax = Coach.addSyntax;

GrapeQLCoach.addSyntax("Comment", require("./syntax/Comment"));
GrapeQLCoach.addSyntax("PgNull", require("./syntax/PgNull"));
GrapeQLCoach.addSyntax("SystemVariable", require("./syntax/SystemVariable"));
GrapeQLCoach.addSyntax("PgNumber", require("./syntax/PgNumber"));
GrapeQLCoach.addSyntax("DoubleQuotes", require("./syntax/DoubleQuotes"));
GrapeQLCoach.addSyntax("PgString", require("./syntax/PgString"));

// need for tests
if ( typeof window !== "undefined" ) {
    window.GrapeQLCoach = GrapeQLCoach;
}

module.exports = GrapeQLCoach;