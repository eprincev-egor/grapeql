"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
const config = require("./config");
const testRequest = require("./utils/testRequest");
const weakDeepEqual = require("./utils/weakDeepEqual");

global.it = function(testName, callback) {
    callback();
};

function testReplaceLinks(test) {
    // test.expression + "  =>  " + test.result
    it(`
        expression:
        ${test.expression}
        replace
        ${test.replace}
        to
        ${test.to}
    `, () => {

        let coach;

        coach = new GrapeQLCoach(test.expression);
        coach.skipSpace();
        let expression = coach.parseExpression();

        expression.replaceLink(test.replace, test.to);

        coach = new GrapeQLCoach(test.result);
        coach.skipSpace();
        let expectedExpression = coach.parseExpression();

        let isEqual = !!weakDeepEqual(expression, expectedExpression);
        if ( !isEqual ) {
            console.log("break here");
        }
    });
}

let server;
(async function() {
    server = await GrapeQL.start(config);

    global.server = server;
    global.testRequest = testRequest;
    global.testReplaceLinks = testReplaceLinks;

    console.log( GrapeQL );
    console.log( GrapeQLCoach );
    console.log( testRequest );
})();


setInterval(() => {}, 100000);
