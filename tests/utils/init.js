"use strict";

const {stopServer, startServer, clearDatabase} = require("./serverHelpers");

const testRemoveUnnecessaryJoins = require("./testRemoveUnnecessaryJoins");
const testRemoveUnnecessaryWithes = require("./testRemoveUnnecessaryWithes");
const testGetDbColumn = require("./testGetDbColumn");
const testReplaceLinks = require("./testReplaceLinks");
const testFindDeps = require("./testFindDeps");

const testRequest = require("./testRequest");
const testRequestCount = require("./testRequestCount");
const testRequestIndexOf = require("./testRequestIndexOf");
const testInsert = require("./testInsert");
const testUpdate = require("./testUpdate");
const testDelete = require("./testDelete");

function init(__dirname) {
    let server;

    before(startServer(
        __dirname,
        _server => {server = _server;}
    ));

    after(stopServer(
        () => server
    ));

    let getServer = () => server;

    return {
        getServer,
        clearDatabase,
        testReplaceLinks,
        testRemoveUnnecessaryJoins: testRemoveUnnecessaryJoins.bind(null, getServer),
        testRemoveUnnecessaryWithes: testRemoveUnnecessaryWithes.bind(null, getServer),
        testRequest: testRequest.bind(null, getServer),
        testRequestCount: testRequestCount.bind(null, getServer),
        testRequestIndexOf: testRequestIndexOf.bind(null, getServer),
        testInsert: testInsert.bind(null, getServer),
        testUpdate: testUpdate.bind(null, getServer),
        testDelete: testDelete.bind(null, getServer),
        testGetDbColumn: testGetDbColumn.bind(null, getServer),
        testFindDeps: testFindDeps.bind(null, getServer)
    };
}

module.exports = init;
