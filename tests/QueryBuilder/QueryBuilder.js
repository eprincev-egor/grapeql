(function(QUnit, QueryBuilder, GrapeQLCoach) {
    "use strict";
    
    let normolizeSyntaxBeforeEqual = window.normolizeSyntaxBeforeEqual;
    
    
    window.tests.list.forEach(test => {
        let server = {nodes: {}};
        
        for (let nodeName in test.nodes) {
            let node = {};
            let nodeSQL = test.nodes[ nodeName ];
            node.parsed = GrapeQLCoach.parseEntity(nodeSQL);
            
            server.nodes[ nodeName ] = node;
        }
        
        server.tables = test.tables;
        
        QUnit.test(test.testName, (assert) => {
            test.tests.forEach(requestTest => {
                
                
                let builder = new QueryBuilder(server, server.nodes[ requestTest.reqeustNode ]);
                let query = builder.get( requestTest.reqeust );
                
                let result = GrapeQLCoach.parseEntity( query.toString() );
                let testResult = GrapeQLCoach.parseEntity( requestTest.result );
                
                normolizeSyntaxBeforeEqual(result);
                normolizeSyntaxBeforeEqual(testResult);
                
                let isEqual = !!window.weakDeepEqual(testResult, result);
                if ( !isEqual ) {
                    console.log("break here");
                }
                
                assert.pushResult({
                    result: isEqual,
                    actual: query.toString(),
                    expected: requestTest.result,
                    message: JSON.stringify( requestTest.reqeust, null, 4 )
                });
            });
        });
    });
    
})(window.QUnit, window.tests.QueryBuilder, window.tests.GrapeQLCoach);
