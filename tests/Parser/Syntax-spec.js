"use strict";

const assert = require("assert");

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

let tests = {};
tests.TableConstraint = require("./syntax/TableConstraint");
tests.Boolean = require("./syntax/Boolean");
tests.CaseWhen = require("./syntax/CaseWhen");
tests.CaseWhenElement = require("./syntax/CaseWhenElement");
tests.Cast = require("./syntax/Cast");
tests.Column = require("./syntax/Column");
tests.Comment = require("./syntax/Comment");
tests.DataType = require("./syntax/DataType");
tests.DoubleQuotes = require("./syntax/DoubleQuotes");
tests.In = require("./syntax/In");
tests.Between = require("./syntax/Between");
tests.Expression = require("./syntax/Expression");
tests.File = require("./syntax/File");
tests.FromItem = require("./syntax/FromItem");
tests.FunctionCall = require("./syntax/FunctionCall");
tests.GroupByElement = require("./syntax/GroupByElement");
tests.Join = require("./syntax/Join");
tests.ObjectLink = require("./syntax/ObjectLink");
tests.ObjectName = require("./syntax/ObjectName");
tests.Operator = require("./syntax/Operator");
tests.OrderByElement = require("./syntax/OrderByElement");
tests.PgNull = require("./syntax/PgNull");
tests.PgNumber = require("./syntax/PgNumber");
tests.PgString = require("./syntax/PgString");
tests.Select = require("./syntax/Select");
tests.SystemVariable = require("./syntax/SystemVariable");
tests.ToType = require("./syntax/ToType");
tests.WithQuery = require("./syntax/WithQuery");
tests.CacheReverseExpression = require("./syntax/CacheReverseExpression");
tests.CacheFor = require("./syntax/CacheFor");
tests.WindowDefinition = require("./syntax/WindowDefinition");
tests.With = require("./syntax/With");
tests.Delete = require("./syntax/Delete");
tests.ValueItem = require("./syntax/ValueItem");
tests.ValuesRow = require("./syntax/ValuesRow");
tests.Insert = require("./syntax/Insert");
tests.SetItem = require("./syntax/SetItem");
tests.Update = require("./syntax/Update");
tests.ColumnDefinition = require("./syntax/ColumnDefinition");
tests.Extention = require("./syntax/Extention");

//let index = 0; // for conditional break point
function testClass(className, tests) {
    describe(className, () => {
        tests.forEach(test => {
            it(test.str, () => {

                let str = test.str,
                    parseFuncName = "parse" + className;

                    //index++;
                    //console.log(index);

                if ( test.err ) {
                    try {
                        let coach = new GrapeQLCoach(str);
                        coach[ parseFuncName ]();
                        assert.ok(false, "expected error: " + str);
                    } catch(err) {
                        assert.ok(true, "expected error: " + str);
                    }
                }

                else if ( test.result ) {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();

                    let isEqual = !!weakDeepEqual(test.result, result);
                    if ( !isEqual ) {
                        console.log("break here");
                    }

                    assert.ok(isEqual);


                    // auto test clone and toString
                    let clone = result.clone();
                    let cloneString = clone.toString();
                    let cloneCoach = new GrapeQLCoach( cloneString );
                    let cloneResult = cloneCoach[ parseFuncName ]();

                    isEqual = !!weakDeepEqual(test.result, cloneResult);
                    assert.ok(isEqual);
                }

            });

        });
    });
}

for (let className in tests) {
    testClass(className, tests[ className ]);
}



function testReplaceComments(assert, strFrom, strTo) {
    let coach = new GrapeQLCoach(strFrom);
    coach.replaceComments();
    assert.equal(coach.str, strTo, strFrom);
}

describe("replaceComments", () => {

    testReplaceComments(assert, "1-- \n1", "1   \n1");
    testReplaceComments(assert, "1-- \r1", "1   \r1");
    testReplaceComments(assert, "1--123\n\r1", "1     \n\r1");
    testReplaceComments(assert, "1+/*\n\r*/2", "1+  \n\r  2");
    testReplaceComments(assert, "1 + /* \n\r */2", "1 +    \n\r   2");
});

function testGetType(assert, str, result) {
    let coach = new GrapeQLCoach(str);
    let expr = coach.parseExpression();
    let type = expr.getType();

    assert.equal( type, result, `${ str }   => ${ result }` );
}

describe("Expression.getType()", () => {

    testGetType(assert, "0", "integer");
    testGetType(assert, "1", "integer");
    testGetType(assert, "-1", "integer");
    testGetType(assert, "+'1'", "double precision");
    testGetType(assert, "- + '2' - - 1", "double precision");

    testGetType(assert, "'2018-01-21 22:02:21.993628'::date::text || '120'::char(2)::text::integer - -8", "text");
    testGetType(assert, "(-1 + 2.1) * '0'::numeric - ( ('-2')::bigint + 8)", "numeric");
});

describe("Syntax.findParent", () => {

    let coach = new GrapeQLCoach("select id + 1 from table");
    let select = coach.parseSelect();
    let column = select.columns[0];

    let parent;

    parent = column.findParent(parent => parent instanceof GrapeQLCoach.Select);
    assert.ok(parent === select, "findParent good");

    parent = column.expression.elements[0].findParent(parent => parent instanceof GrapeQLCoach.Select);
    assert.ok(parent === select, "findParent good");
});

describe("select.toString() without from", () => {
    let coach = new GrapeQLCoach("select 1");
    let select = coach.parseSelect();

    let str = select.toString();

    assert.equal(str.trim(), "select 1");
});

describe("select.toString() joins without commad", () => {
    let coach = new GrapeQLCoach("select 1 from x left join y on true left join z on true");
    let select = coach.parseSelect();

    let str = select.toString();

    assert.equal(str.replace(/\s+/g, " ").trim(), "select 1 from x left join y on true left join z on true");
});

describe("ObjectName.equal", () => {
    let coach;
    let left, right;

    it("\"hello\"  ==  hello", () => {
        coach = new GrapeQLCoach("\"hello\"");
        left = coach.parseObjectName();

        coach = new GrapeQLCoach("hello");
        right = coach.parseObjectName();

        assert.ok( left.equal(right) );
        assert.ok( right.equal(left) );
    });

    it("hEllo  ==  hello", () => {
        coach = new GrapeQLCoach("hEllo");
        left = coach.parseObjectName();

        coach = new GrapeQLCoach("hello");
        right = coach.parseObjectName();

        assert.ok( left.equal(right) );
        assert.ok( right.equal(left) );
    });
});

describe("File.toObjectName", () => {
    let coach, file, filePathElem,
        objectName;

    it("Country.sql => Country", () => {
        coach = new GrapeQLCoach("Country.sql");
        filePathElem = coach.parseFilePathElement();

        objectName = filePathElem.toObjectName();

        assert.equal("Country", objectName.toString());
    });

    it("Country-start => \"Country-start\"", () => {
        coach = new GrapeQLCoach("Country-start");
        filePathElem = coach.parseFilePathElement();

        objectName = filePathElem.toObjectName();

        assert.equal("\"Country-start\"", objectName.toString());
    });

    it("Country-start.sql => \"Country-start\"", () => {
        coach = new GrapeQLCoach("Country-start.sql");
        filePathElem = coach.parseFilePathElement();

        objectName = filePathElem.toObjectName();

        assert.equal("\"Country-start\"", objectName.toString());
    });

    it("\"some\"\"name\" => \"some\"\"name\"", () => {
        coach = new GrapeQLCoach("\"some\"\"name\"");
        filePathElem = coach.parseFilePathElement();

        objectName = filePathElem.toObjectName();

        assert.equal("\"some\"\"name\"", objectName.toString());
    });

    it("./Check/Path/Country.sql => Country", () => {
        coach = new GrapeQLCoach("./Check/Path/Country.sql");
        file = coach.parseFile();

        objectName = file.toObjectName();

        assert.equal("Country", objectName.toString());
    });
});

describe("new Syntax('some str')", () => {
    it("new ObjectName('word')", () => {
        const ObjectName = GrapeQLCoach.ObjectName;

        let object = new ObjectName("word");
        assert.equal("word", object.toString());
    });

    it("new ObjectName('word')", () => {
        const ObjectLink = GrapeQLCoach.ObjectLink;

        let link = new ObjectLink(" a.b.c.d");
        assert.equal("a.b.c.d", link.toString());
    });
});
