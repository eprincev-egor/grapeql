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
        
        testFilter(assert, ["ID", "=", 4], "ID = 4", {
            ID: {
                type: "integer",
                sql: "ID"
            }
        });
        
        testFilter(assert, ["ID", "==", "4"], "ID = 4", {
            ID: {
                type: "integer",
                sql: "ID"
            }
        });
        
        testFilter(assert, [["ID", "equal", "2"], "OR", ["ID", "=", -3]], "(ID = 2) or (ID = -3)", {
            ID: {
                type: "numeric(10, 2)",
                sql: "ID"
            }
        });
        
    });
    
})(window.QUnit, window.tests.Filter, window.tests.GrapeQLCoach);