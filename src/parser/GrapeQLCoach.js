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
GrapeQLCoach.addSyntax("TableLink", require("./syntax/TableLink"));
GrapeQLCoach.addSyntax("ColumnLink", require("./syntax/ColumnLink"));
GrapeQLCoach.addSyntax("FunctionLink", require("./syntax/FunctionLink"));
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
GrapeQLCoach.addSyntax("CacheReverseExpression", require("./syntax/CacheReverseExpression"));
GrapeQLCoach.addSyntax("CacheFor", require("./syntax/CacheFor"));
GrapeQLCoach.addSyntax("With", require("./syntax/With"));
GrapeQLCoach.addSyntax("Delete", require("./syntax/Delete"));
GrapeQLCoach.addSyntax("ValueItem", require("./syntax/ValueItem"));
GrapeQLCoach.addSyntax("ValuesRow", require("./syntax/ValuesRow"));
GrapeQLCoach.addSyntax("ConflictTargetItem", require("./syntax/ConflictTargetItem"));
GrapeQLCoach.addSyntax("OnConflict", require("./syntax/OnConflict"));
GrapeQLCoach.addSyntax("Insert", require("./syntax/Insert"));
GrapeQLCoach.addSyntax("SetItem", require("./syntax/SetItem"));
GrapeQLCoach.addSyntax("Update", require("./syntax/Update"));
GrapeQLCoach.addSyntax("ColumnDefinition", require("./syntax/ColumnDefinition"));
GrapeQLCoach.addSyntax("TableConstraint", require("./syntax/TableConstraint"));
GrapeQLCoach.addSyntax("Extension", require("./syntax/Extension"));
GrapeQLCoach.addSyntax("VariableDefinition", require("./syntax/VariableDefinition"));
GrapeQLCoach.addSyntax("Declare", require("./syntax/Declare"));
GrapeQLCoach.addSyntax("QueryNode", require("./syntax/QueryNode"));
GrapeQLCoach.addSyntax("PgArray", require("./syntax/PgArray"));

GrapeQLCoach.parseEntity = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseQueryNode();
};

GrapeQLCoach.parseSelect = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseSelect();
};

GrapeQLCoach.parseInsert = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseInsert();
};

GrapeQLCoach.parseUpdate = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseUpdate();
};

GrapeQLCoach.parseDelete = function(str) {
    let coach = new GrapeQLCoach(str);
    coach.replaceComments();
    coach.skipSpace();
    return coach.parseDelete();
};

GrapeQLCoach.parseCommand = function(sql) {
    let coach = new GrapeQLCoach(sql);
    coach.replaceComments();
    coach.skipSpace();
    
    if ( coach.isInsert() ) {
        return coach.parseInsert({ allowReturningObject: true });
    }
    else if ( coach.isUpdate() ) {
        return coach.parseUpdate({ allowReturningObject: true });
    }
    else if ( coach.isDelete() ) {
        return coach.parseDelete({ allowReturningObject: true });
    }
    else if ( coach.isSelect() ) {
        return coach.parseSelect({ allowReturningObject: true });
    }
    else {
        throw new Error(`unrecognized command ${sql}`);
    }

};


module.exports = GrapeQLCoach;
