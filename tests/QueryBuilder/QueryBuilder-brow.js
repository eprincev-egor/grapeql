"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const restoreTestServer = require("../utils/restoreTestServer");
let dump = require("../test-servers/server1/server-dump.json");
let server1 = restoreTestServer(dump);

const tests = require("./QueryBuilder");

QUnit.module("QueryBuilder", {}, function() {
    tests(() => ({
        server1
    }));
});
