"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

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
        let cloneExpression = expression.clone();

        expression.replaceLink(test.replace, test.to);
        cloneExpression.replaceLink(test.replace, test.to);

        coach = new GrapeQLCoach(test.result);
        coach.skipSpace();
        let expectedExpression = coach.parseExpression();

        let isEqual = !!weakDeepEqual(expression, expectedExpression);
        let isEqualClone = !!weakDeepEqual(cloneExpression, expectedExpression);

        if ( !isEqual ) {
            console.log("break here");
        }
        if ( !isEqualClone ) {
            console.log("break here");
        }

        assert.ok(isEqual && isEqualClone);
    });
}

module.exports = testReplaceLinks;
