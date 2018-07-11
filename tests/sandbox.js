"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
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
const testFilterToSql = require("./utils/testFilterToSql");

const weakDeepEqual = require("./utils/weakDeepEqual");

global.it = function(testName, callback) {
    callback();
};

let server;
(async function() {
    server = await GrapeQL.start(config);
    let getServer = () => server;

    global.server = server;
    global.testFilterToSql = testFilterToSql;
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

    testSyntax("Insert", {
        str: "insert into company (some_date, some_timestamp) values ('2017-12-31T21:00:00.000Z'::date, '2017-12-31T21:00:00.000Z'::timestamp without time zone)",
        result: {
            table: {link: [
                {word: "company"}
            ]},
            columns: [
                {word: "some_date"},
                {word: "some_timestamp"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {content: "2017-12-31T21:00:00.000Z"},
                        {dataType: {
                            type: "date"
                        }}
                    ]}},
                    {expression: {elements: [
                        {content: "2017-12-31T21:00:00.000Z"},
                        {dataType: {
                            type: "timestamp without time zone"
                        }}
                    ]}}
                ]}
            ]
        }
    });
})();


setInterval(() => {}, 100000);
