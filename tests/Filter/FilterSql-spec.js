"use strict";

const testFilterToSql = require("../utils/testFilterToSql");

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


describe("Filter building sql", () => {


    describe( "equal, ==, =, =, >=, <=, <, >, <>", () => {

        let simpleOperators = ["equal", "==", "=", "=", ">=", "<=", "<", ">", "<>"];

        simpleOperators.forEach(operator => {
            let sqlOperator = operator;
            if ( operator == "==" || operator == "equal" ) {
                sqlOperator = "=";
            }

            testFilterToSql( ["ID", operator, 4], `ID ${sqlOperator} 4`, {
                ID: {
                    type: "integer",
                    sql: "ID"
                }
            });

            testFilterToSql( ["ID", operator, "123456789123456789123456789123456789123456789123456789"], `ID ${sqlOperator} 123456789123456789123456789123456789123456789123456789`, {
                ID: {
                    type: "bigint",
                    sql: "ID"
                }
            });

            testFilterToSql( ["ID", operator, "4.2"], `ID ${sqlOperator} 4.2`, {
                ID: {
                    type: "double precision",
                    sql: "ID"
                }
            });


            let date = new Date();

            testFilterToSql( ["SOME_DATE", operator, date], `SOME_DATE ${sqlOperator} '${date.toISOString()}'::date`, {
                SOME_DATE: {
                    type: "date",
                    sql: "SOME_DATE"
                }
            });

            testFilterToSql( ["SOME_TIMESTAMP", operator, date], `SOME_TIMESTAMP ${sqlOperator} '${date.toISOString()}'::timestamp with time zone`, {
                SOME_TIMESTAMP: {
                    type: "timestamp with time zone",
                    sql: "SOME_TIMESTAMP"
                }
            });
        });

        testFilterToSql( [["ID", "equal", "2"], "OR", ["ID", "=", -3]], "ID = 2 or ID = -3", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            }
        });

        testFilterToSql( [ [["ID", "=", "2"], "OR", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "(ID = 2 or ID = 3) and ID_COUNTRY = 1", {
            ID: {
                type: "numEric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smallint",
                sql: "ID_COUNTRY"
            }
        });

        testFilterToSql( [ [["ID", "=", "2"], "and", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "ID = 2 and ID = 3 and ID_COUNTRY = 1", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smaLlint",
                sql: "ID_COUNTRY"
            }
        });

        testFilterToSql( ["NAME", "=", 4], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "4"], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "$tag1$"], "NAME = '$tag1$'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "$tag1$$tag2$"], "NAME = '$tag1$$tag2$'", {
            NAME: {
                type: "tExt",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "character vaRying(100 )",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "charActer varying( 100 )",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "varcHar( 100 )",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "chAr( 100 )",
                sql: "NAME"
            }
        });

        testFilterToSql( ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "\"char\"",
                sql: "NAME"
            }
        });

    });

    describe( "in", () => {

        testFilterToSql( ["ID", "in", []], "false", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilterToSql( ["ID", "in", [1,2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilterToSql( ["ID", "in", ["1",2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });

        testFilterToSql( ["NAME", "in", ["Igor", "Petr", "'", "\"", "$$", "$tag1$", 4]], "NAME in ('Igor', 'Petr', $$'$$, $$\"$$, '$$', '$tag1$', '4')", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });

    });

    describe( "is", () => {

        testFilterToSql( ["ID", "is", "null"], "ID is null", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilterToSql( ["NAME", "is", "null"], "NAME is null", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["ID", "is", "not  Null"], "ID is not null", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilterToSql( ["NAME", "is", "not null"], "NAME is not null", {
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

        testFilterToSql( ["SOME_DATE", "is", "today"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });

        // tomorrow
        startSql = tomorrowStart();
        endSql = tomorrowEnd();

        startSql = new Date(startSql);
        endSql = new Date(endSql);

        startSql = "'" + startSql.toISOString() + "'::timestamp with time zone";
        endSql = "'" + endSql.toISOString() + "'::timestamp with time zone";

        testFilterToSql( ["SOME_DATE", "is", "tomorrow"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });
    });

    describe( "contain", () => {
        testFilterToSql( ["NAME", "contain", "sUb"], "NAME ilike '%sub%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "x%"], "NAME ilike '%x\\%%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "_Y"], "NAME ilike '%\\_y%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "_\\"], "NAME ilike '%\\_\\\\%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "''"], "NAME ilike $$%''%$$", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "\"\""], "NAME ilike $$%\"\"%$$", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", "$tag1$some$tag1$"], "NAME ilike $tag2$%$tag1$some$tag1$%$tag2$", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", ""], "NAME ilike '%%'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["NAME", "contain", " "], "NAME ilike '% %'", {
            NAME: {type: "text", sql: "NAME"}
        });

        testFilterToSql( ["ID", "contain", 1], "ID::text ilike '%1%'", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilterToSql( ["ID", "contain", null], "false", {
            ID: {type: "bigint", sql: "ID"}
        });

        testFilterToSql( ["SOME_TIMESTAMP", "contain", 2017], "SOME_TIMESTAMP::date::text ilike '%2017%'", {
            SOME_TIMESTAMP: {type: "timestamp with time zone", sql: "SOME_TIMESTAMP"}
        });
    });

    describe( "inRange", () => {
        testFilterToSql( ["SOME_DATE", "inRange", []], "false", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });

        testFilterToSql( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], "SOME_DATE >= '1970-01-01T00:00:00.000Z'::date and SOME_DATE <= '1970-01-01T00:00:00.001Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });

        testFilterToSql( ["SOME_DATE", "inRange", [{start: -10, end: 10}]], "SOME_DATE >= '1969-12-31T23:59:59.990Z'::date and SOME_DATE <= '1970-01-01T00:00:00.010Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });
    });


});
