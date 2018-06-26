"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
const Filter = require("../src/filter/Filter");
const config = require("./grapeql.config");

const testRequest = require("./utils/testRequest");
const testRequestCount = require("./utils/testRequestCount");
const testRequestIndexOf = require("./utils/testRequestIndexOf");
const testUpdate = require("./utils/testUpdate");
const testInsert = require("./utils/testInsert");

const testGetDbColumn = require("./utils/testGetDbColumn");
const testRemoveUnnesaryWiths = require("./utils/testRemoveUnnesaryWiths");
const testRemoveUnnesaryJoins = require("./utils/testRemoveUnnesaryJoins");
const testReplaceLinks = require("./utils/testReplaceLinks");
const testSyntax = require("./utils/testSyntax");

const weakDeepEqual = require("./utils/weakDeepEqual");

global.it = function(testName, callback) {
    callback();
};

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
    let getServer = () => server;

    global.server = server;
    global.testFilter = testFilter;
    global.testSyntax = testSyntax;

    global.testRequest = testRequest.bind(null, getServer);
    global.testRequestCount = testRequestCount.bind(null, getServer);
    global.testRequestIndexOf = testRequestIndexOf.bind(null, getServer);
    global.testRemoveUnnesaryWiths = testRemoveUnnesaryWiths.bind(null, getServer);
    global.testUpdate = testUpdate.bind(null, getServer);
    global.testInsert = testInsert.bind(null, server);

    global.testReplaceLinks = testReplaceLinks;
    global.testGetDbColumn = testGetDbColumn;
    global.testRemoveUnnesaryJoins = testRemoveUnnesaryJoins.bind(null, getServer);

    global.weakDeepEqual = weakDeepEqual;
    global.GrapeQL = GrapeQL;
    global.GrapeQLCoach = GrapeQLCoach;


})();


setInterval(() => {}, 100000);
