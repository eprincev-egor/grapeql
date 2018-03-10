(function(QUnit, Filter, GrapeQLCoach) {
    "use strict";
    
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
    
    function testFilter(assert, fromFilter, sql, model) {
        let parsedSql = new GrapeQLCoach(sql);
        parsedSql.skipSpace();
        parsedSql = parsedSql.parseExpression();
        
        let filter = new Filter(fromFilter);
        let filterSql = filter.toSql( model );
        let parsedFilterSql = new GrapeQLCoach( filterSql );
        
        parsedFilterSql.skipSpace();
        parsedFilterSql = parsedFilterSql.parseExpression();
        
        let isEqual = !!window.weakDeepEqual(parsedSql, parsedFilterSql);
        if ( !isEqual ) {
            console.log("break here");
        }
        
        assert.pushResult({
            result: isEqual,
            actual: filterSql,
            expected: sql,
            message: JSON.stringify(fromFilter) + " => `" + sql + "`"
        });
    }
    
    QUnit.test( "equal, ==, =, =, >=, <=, <, >, <>", function( assert ) {
        
        let simpleOperators = ["equal", "==", "=", "=", ">=", "<=", "<", ">", "<>"];
        
        simpleOperators.forEach(operator => {
            let sqlOperator = operator;
            if ( operator == "==" || operator == "equal" ) {
                sqlOperator = "=";
            }
            
            testFilter(assert, ["ID", operator, 4], `ID ${sqlOperator} 4`, {
                ID: {
                    type: "integer",
                    sql: "ID"
                }
            });
            
            testFilter(assert, ["ID", operator, "123456789123456789123456789123456789123456789123456789"], `ID ${sqlOperator} 123456789123456789123456789123456789123456789123456789`, {
                ID: {
                    type: "bigint",
                    sql: "ID"
                }
            });
            
            testFilter(assert, ["ID", operator, "4.2"], `ID ${sqlOperator} 4.2`, {
                ID: {
                    type: "double precision",
                    sql: "ID"
                }
            });
            
            
            let date = new Date();
            
            testFilter(assert, ["SOME_DATE", operator, date], `SOME_DATE ${sqlOperator} '${date.toISOString()}'::date`, {
                SOME_DATE: {
                    type: "date",
                    sql: "SOME_DATE"
                }
            });
            
            testFilter(assert, ["SOME_TIMESTAMP", operator, date], `SOME_TIMESTAMP ${sqlOperator} '${date.toISOString()}'::timestamp with time zone`, {
                SOME_TIMESTAMP: {
                    type: "timestamp with time zone",
                    sql: "SOME_TIMESTAMP"
                }
            });
        });
        
        testFilter(assert, [["ID", "equal", "2"], "OR", ["ID", "=", -3]], "ID = 2 or ID = -3", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            }
        });
        
        testFilter(assert, [ [["ID", "=", "2"], "OR", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "(ID = 2 or ID = 3) and ID_COUNTRY = 1", {
            ID: {
                type: "numEric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smallint",
                sql: "ID_COUNTRY"
            }
        });
        
        testFilter(assert, [ [["ID", "=", "2"], "and", ["ID", "=", 3]], "AND", ["ID_COUNTRY", "=", 1]  ], "ID = 2 and ID = 3 and ID_COUNTRY = 1", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            },
            ID_COUNTRY: {
                type: "smaLlint",
                sql: "ID_COUNTRY"
            }
        });
        
        testFilter(assert, ["NAME", "=", 4], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "4"], "NAME = '4'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "$tag1$"], "NAME = '$tag1$'", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "$tag1$$tag2$"], "NAME = '$tag1$$tag2$'", {
            NAME: {
                type: "tExt",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "character vaRying(100 )",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "charActer varying( 100 )",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "varcHar( 100 )",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "chAr( 100 )",
                sql: "NAME"
            }
        });
        
        testFilter(assert, ["NAME", "=", "''"], "NAME = $$''$$", {
            NAME: {
                type: "\"char\"",
                sql: "NAME"
            }
        });
        
    });
    
    QUnit.test( "in", function( assert ) {
        
        testFilter(assert, ["ID", "in", []], "false", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });
        
        testFilter(assert, ["ID", "in", [1,2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });
        
        testFilter(assert, ["ID", "in", ["1",2]], "ID in (1,2)", {
            ID: {
                type: "bigint",
                sql: "ID"
            }
        });
        
        testFilter(assert, ["NAME", "in", ["Igor", "Petr", "'", "\"", "$$", "$tag1$", 4]], "NAME in ('Igor', 'Petr', $$'$$, $$\"$$, '$tag1$', '4')", {
            NAME: {
                type: "text",
                sql: "NAME"
            }
        });
        
    });
    
    QUnit.test( "is", function( assert ) {
        
        testFilter(assert, ["ID", "is", "null"], "ID is null", {
            ID: {type: "bigint", sql: "ID"}
        });
        
        testFilter(assert, ["NAME", "is", "null"], "NAME is null", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["ID", "is", "not  Null"], "ID is not null", {
            ID: {type: "bigint", sql: "ID"}
        });
        
        testFilter(assert, ["NAME", "is", "not null"], "NAME is not null", {
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
        
        testFilter(assert, ["SOME_DATE", "is", "today"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });
        
        // tomorrow
        startSql = tomorrowStart();
        endSql = tomorrowEnd();
        
        startSql = new Date(startSql);
        endSql = new Date(endSql);
        
        startSql = "'" + startSql.toISOString() + "'::timestamp with time zone";
        endSql = "'" + endSql.toISOString() + "'::timestamp with time zone";
        
        testFilter(assert, ["SOME_DATE", "is", "tomorrow"], "SOME_DATE >= " + startSql + " and SOME_DATE <= " + endSql, {
            SOME_DATE: {type: "timestamp with time zone", sql: "SOME_DATE"}
        });
    });
    
    QUnit.test( "contain", function( assert ) {
        testFilter(assert, ["NAME", "contain", "sUb"], "NAME ilike '%sub%'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "x%"], "NAME ilike '%x\\%%'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "_Y"], "NAME ilike '%\\_Y%'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "_\\"], "NAME ilike '%\\_\\\\%'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "''"], "NAME ilike $$%''%$$", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "\"\""], "NAME ilike $$%\"\"%$$", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", "$tag1$some$tag1$"], "NAME ilike '$tag1$some$tag1$'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", ""], "NAME ilike '%%'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["NAME", "contain", " "], "NAME ilike '% %'", {
            NAME: {type: "text", sql: "NAME"}
        });
        
        testFilter(assert, ["ID", "contain", 1], "ID::text ilike '%1%'", {
            ID: {type: "bigint", sql: "ID"}
        });
        
        testFilter(assert, ["ID", "contain", null], "false", {
            ID: {type: "bigint", sql: "ID"}
        });
        
        testFilter(assert, ["SOME_TIMESTAMP", "contain", 2017], "SOME_TIMESTAMP::date::text ilike '%2017%'", {
            SOME_TIMESTAMP: {type: "timestamp with time zone", sql: "SOME_TIMESTAMP"}
        });
    });
    
    QUnit.test( "inRange", function( assert ) {
        testFilter(assert, ["SOME_DATE", "inRange", []], "false", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });
        
        testFilter(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], "SOME_DATE >= '1970-01-01T00:00:00.000Z'::date and SOME_DATE <= '1970-01-01T00:00:00.001Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });
        
        testFilter(assert, ["SOME_DATE", "inRange", [{start: -10, end: 10}]], "SOME_DATE >= '1969-12-31T23:59:59.990Z'::date and SOME_DATE <= '1970-01-01T00:00:00.010Z'::date", {
            SOME_DATE: {type: "date", sql: "SOME_DATE"}
        });
    });
    
    
})(window.QUnit, window.tests.Filter, window.tests.GrapeQLCoach);
