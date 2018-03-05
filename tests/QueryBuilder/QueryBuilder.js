(function(QUnit, Query, GrapeQLCoach) {
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
        
        server.schemes = test.schemes;
        
        QUnit.test(test.testName, (assert) => {
            test.tests.forEach(requestTest => {
                
                
                let query = new Query({
                    server, 
                    node: server.nodes[ requestTest.reqeustNode ],
                    request: requestTest.request
                });
                
                let resultSql = query.toString();
                let result = GrapeQLCoach.parseEntity( resultSql );
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
                    message: JSON.stringify( requestTest.request, null, 4 )
                });
            });
        });
    });
    
})(window.QUnit, window.tests.Query, window.tests.GrapeQLCoach);
