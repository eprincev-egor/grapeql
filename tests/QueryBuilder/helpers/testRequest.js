"use strict";

const weakDeepEqual = require("../../utils/weakDeepEqual");
const GrapeQLCoach = require("../../../src/parser/GrapeQLCoach");
const Query = require("../../../src/server/Query");

function testRequest(assert, server, requestTest) {
    let query = new Query({
        server, 
        node: server.nodes[ requestTest.reqeustNode ],
        request: requestTest.request
    });
        
    let resultSql = query.toString();
    let result = GrapeQLCoach.parseEntity( resultSql );
    let testResult = GrapeQLCoach.parseEntity( requestTest.result );
        
    let isEqual = !!weakDeepEqual(testResult, result);
    if ( !isEqual ) {
        console.log("break here");
    }
        
    assert.pushResult({
        result: isEqual,
        actual: query.toString(),
        expected: requestTest.result,
        message: JSON.stringify( requestTest.request, null, 4 )
    });
}

module.exports = testRequest;