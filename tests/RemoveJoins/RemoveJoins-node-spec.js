"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const tests = require("./RemoveJoins");

let SERVER_1;
const initServer1 = require("../test-servers/server1/index");

QUnit.module("Select.removeUnnesaryJoins", {
    before: async function() {
        SERVER_1 = await initServer1();
    }
}, function() {
    QUnit.test("wait server", function(assert) {
        assert.ok(!!SERVER_1, "server exists");
        tests(SERVER_1);
    });
});
