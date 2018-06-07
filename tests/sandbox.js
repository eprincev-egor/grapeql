"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
const Filter = require("../src/filter/Filter");
const config = require("./config");
const {testRequest, testRequestCount, testRequestIndexOf} = require("./utils/testRequest");
const weakDeepEqual = require("./utils/weakDeepEqual");

global.it = function(testName, callback) {
    callback();
};

function testRemoveUnnesaryWiths(fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {

        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        parsedFromSelect.removeUnnesaryWiths({server});

        let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);

        return isEqual;
    });
}

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
    });
}

function testRemoveUnnesaryJoins(fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {
        let node;
        node = server.addNode("Country", "select * from country");
        node.options.file = "./Country.sql";

        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        parsedFromSelect.removeUnnesaryJoins({server});

        return weakDeepEqual(parsedFromSelect, parsedToSelect);
    });
}

function testGetDbColumn(test) {
    it(`
        find ${ test.link } in
        ${ test.node }
    `, () => {

        let coach;

        coach = new GrapeQLCoach(test.link.trim());
        let link = coach.parseObjectLink();

        coach = new GrapeQLCoach(test.node.trim());
        let select = coach.parseSelect();

        select.getColumnSource({
            server
        }, link);
    });
}

function testSyntax(className, test) {
    it(test.str, () => {

        let str = test.str,
            parseFuncName = "parse" + className;


        let coach = new GrapeQLCoach(str);
        let result = coach[ parseFuncName ]();

        let isEqual = !!weakDeepEqual(test.result, result);
        if ( !isEqual ) {
            console.log("break here");
        }


        // auto test clone and toString
        let clone = result.clone();
        let cloneString = clone.toString();
        let cloneCoach = new GrapeQLCoach( cloneString );
        let cloneResult = cloneCoach[ parseFuncName ]();

        isEqual = !!weakDeepEqual(test.result, cloneResult);
    });
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

        return !!weakDeepEqual(parsedSql, parsedFilterSql);
    });
}

let server;
(async function() {
    server = await GrapeQL.start(config);

    global.server = server;
    global.testFilter = testFilter;
    global.testSyntax = testSyntax;
    global.testReplaceLinks = testReplaceLinks;
    global.testRequest = testRequest;
    global.testRequestCount = testRequestCount;
    global.testRequestIndexOf = testRequestIndexOf;
    global.testGetDbColumn = testGetDbColumn;
    global.testRemoveUnnesaryJoins = testRemoveUnnesaryJoins;
    global.testRemoveUnnesaryWiths = testRemoveUnnesaryWiths;
    global.weakDeepEqual = weakDeepEqual;
    global.GrapeQL = GrapeQL;
    global.GrapeQLCoach = GrapeQLCoach;

})();


setInterval(() => {}, 100000);
