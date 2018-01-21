(function(QUnit, Filter, GrapeQLCoach) {
    "use strict";
    
    let normolizeSyntaxBeforeEqual = window.normolizeSyntaxBeforeEqual;
    
    function testFilter(assert, fromFilter, sql, model) {
        let parsedSql = new GrapeQLCoach(sql);
        parsedSql.skipSpace();
        parsedSql = parsedSql.parseExpression();
        
        let filter = new Filter(fromFilter);
        let filterSql = filter.toSql( model );
        let parsedFilterSql = new GrapeQLCoach( filterSql );
        
        parsedFilterSql.skipSpace();
        parsedFilterSql = parsedFilterSql.parseExpression();
        
        normolizeSyntaxBeforeEqual(parsedSql);
        normolizeSyntaxBeforeEqual(parsedFilterSql);
        
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
    
    QUnit.test( "equal", function( assert ) {
        
        let simpleOperators = ["=", "=", ">=", "<=", "<", ">", "<>"];
        
        simpleOperators.forEach(operator => {
            testFilter(assert, ["ID", operator, 4], `ID ${operator} 4`, {
                ID: {
                    type: "integer",
                    sql: "ID"
                }
            });
            
            testFilter(assert, ["ID", operator, "123456789123456789123456789123456789123456789123456789"], `ID ${operator} 123456789123456789123456789123456789123456789123456789`, {
                ID: {
                    type: "bigint",
                    sql: "ID"
                }
            });
            
            testFilter(assert, ["ID", operator, "4.2"], `ID ${operator} 4.2`, {
                ID: {
                    type: "double precision",
                    sql: "ID"
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
    
})(window.QUnit, window.tests.Filter, window.tests.GrapeQLCoach);
