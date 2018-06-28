"use strict";

const {stopServer, startServer, clearDatabase} = require("./serverHelpers");

const testRemoveUnnesaryJoins = require("./testRemoveUnnesaryJoins");
const testRemoveUnnesaryWiths = require("./testRemoveUnnesaryWiths");
const testGetDbColumn = require("./testGetDbColumn");
const testReplaceLinks = require("./testReplaceLinks");

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
        testRemoveUnnesaryJoins: testRemoveUnnesaryJoins.bind(null, getServer),
        testRemoveUnnesaryWiths: testRemoveUnnesaryWiths.bind(null, getServer),
        testRequest: testRequest.bind(null, getServer),
        testRequestCount: testRequestCount.bind(null, getServer),
        testRequestIndexOf: testRequestIndexOf.bind(null, getServer),
        testInsert: testInsert.bind(null, getServer),
        testUpdate: testUpdate.bind(null, getServer),
        testDelete: testDelete.bind(null, getServer),
        testGetDbColumn: testGetDbColumn.bind(null, getServer)
    };
}

module.exports = init;
