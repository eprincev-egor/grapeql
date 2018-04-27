"use strict";

const assert = require("assert");

const Filter = require("../../src/filter/Filter");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function todayStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayEnd() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function tomorrowStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 );
}

function tomorrowEnd() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 23, 59, 59, 999);
}

function testFilter(fromFilter, sql, model) {
    it(JSON.stringify(fromFilter) + " => `" + sql + "`", () => {
        let parsedSql = new GrapeQLCoach(sql);
        parsedSql.skipSpace();
        parsedSql = parsedSql.parseExpression();

        let filter = new Filter(fromFilter);
        let filterSql = filter.toSql( model );
        let parsedFilterSql = new GrapeQLCoach( filterSql );

        parsedFilterSql.skipSpace();
        parsedFilterSql = parsedFilterSql.parseExpression();

        let isEqual = !!weakDeepEqual(parsedSql, parsedFilterSql);

        assert.ok(isEqual);
    });
}

describe("Filter building sql", () => {


    describe( "equal, ==, =, =, >=, <=, <, >, <>", () => {

        let simpleOperators = ["equal", "==", "=", "=", ">=", "<=", "<", ">", "<>"];

        simpleOperators.forEach(operator => {
            let sqlOperator = operator;
            if ( operator == "==" || operator == "equal" ) {
                sqlOperator = "=";
            }

            testFilter( ["ID", operator, 4], `ID ${sqlOperator} 4`, {
                ID: {
                    type: "integer",
                    sql: "ID"
                }
            });

            testFilter( ["ID", operator, "123456789123456789123456789123456789123456789123456789"], `ID ${sqlOperator} 123456789123456789123456789123456789123456789123456789`, {
                ID: {
                    type: "bigint",
                    sql: "ID"
                }
            });

            testFilter( ["ID", operator, "4.2"], `ID ${sqlOperator} 4.2`, {
                ID: {
                    type: "double precision",
                    sql: "ID"
                }
            });


            let date = new Date();

            testFilter( ["SOME_DATE", operator, date], `SOME_DATE ${sqlOperator} '${date.toISOString()}'::date`, {
                SOME_DATE: {
                    type: "date",
                    sql: "SOME_DATE"
                }
            });

            testFilter( ["SOME_TIMESTAMP", operator, date], `SOME_TIMESTAMP ${sqlOperator} '${date.toISOString()}'::timestamp with time zone`, {
                SOME_TIMESTAMP: {
                    type: "timestamp with time zone",
                    sql: "SOME_TIMESTAMP"
                }
            });
        });

        testFilter( [["ID", "equal", "2"], "OR", ["ID", "=", -3]], "ID = 2 or ID = -3", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            }
        });

        testFilter( [ [["ID", "=", "2"], "OR", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "(ID = 2 or ID = 3) and ID_COUNTRY = 1", {
            ID: {
                type: "numEric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smallint",
                sql: "ID_COUNTRY"
            }
        });

        testFilter( [ [["ID", "=", "2"], "and", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "ID = 2 and ID = 3 and ID_COUNTRY = 1", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smaLlint",
                sql: "ID_COUNTRY"
            }
        });

        testFilter( ["NAME", "=", 4], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "4"], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "$tag1$"], "NAME = '$tag1$'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "$tag1$$tag2$"], "NAME = '$tag1$$tag2$'", {
            NAME: {
                type: "tExt",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "character vaRying(100 )",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "charActer varying( 100 )",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "varcHar( 100 )",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "chAr( 100 )",
                sql: "NAME"
            }
        });

        testFilter( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "\"char\"",
                sql: "NAME"
            }
        });

    });

    describe( "in", () => {

        testFilter( ["ID", "in", []], "false", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilter( ["ID", "in", [1,2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilter( ["ID", "in", ["1",2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilter( ["NAME", "in", ["Igor", "Petr", "'", "\"", "$$", "$tag1$", 4]], "NAME in ('Igor', 'Petr', $$'$$, $$\"$$, '$$', '$tag1$', '4')", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

    });

    describe( "is", () => {

        testFilter( ["ID", "is", "null"], "ID is null", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilter( ["NAME", "is", "null"], "NAME is null", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["ID", "is", "not  Null"], "ID is not null", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilter( ["NAME", "is", "not null"], "NAME is not null", {
            NAME: {type: "text", sql: "NAME"}
        });

        let startSql, endSql;

        // today
        startSql = todayStart();
        endSql = todayEnd();

        startSql = new Date(startSql);
        endSql = new Date(endSql);

        startSql = "'" + startSql.toISOString() + "'::timestamp with time zone";
        endSql = "'" + endSql.toISOString() + "'::timestamp with time zone";

        testFilter( ["SOME_DATE", "is", "today"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });

        // tomorrow
        startSql = tomorrowStart();
        endSql = tomorrowEnd();

        startSql = new Date(startSql);
        endSql = new Date(endSql);

        startSql = "'" + startSql.toISOString() + "'::timestamp with time zone";
        endSql = "'" + endSql.toISOString() + "'::timestamp with time zone";

        testFilter( ["SOME_DATE", "is", "tomorrow"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });
    });

    describe( "contain", () => {
        testFilter( ["NAME", "contain", "sUb"], "NAME ilike '%sub%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "x%"], "NAME ilike '%x\\%%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "_Y"], "NAME ilike '%\\_Y%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "_\\"], "NAME ilike '%\\_\\\\%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "''"], "NAME ilike $$%''%$$", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "\"\""], "NAME ilike $$%\"\"%$$", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", "$tag1$some$tag1$"], "NAME ilike '$tag1$some$tag1$'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", ""], "NAME ilike '%%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["NAME", "contain", " "], "NAME ilike '% %'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilter( ["ID", "contain", 1], "ID::text ilike '%1%'", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilter( ["ID", "contain", null], "false", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilter( ["SOME_TIMESTAMP", "contain", 2017], "SOME_TIMESTAMP::date::text ilike '%2017%'", {
            SOME_TIMESTAMP: {type: "timestamp with time zone", sql: "SOME_TIMESTAMP"}
        });
    });

    describe( "inRange", () => {
        testFilter( ["SOME_DATE", "inRange", []], "false", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });

        testFilter( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], "SOME_DATE >= '1970-01-01T00:00:00.000Z'::date and SOME_DATE <= '1970-01-01T00:00:00.001Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });

        testFilter( ["SOME_DATE", "inRange", [{start: -10, end: 10}]], "SOME_DATE >= '1969-12-31T23:59:59.990Z'::date and SOME_DATE <= '1970-01-01T00:00:00.010Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });
    });


});
