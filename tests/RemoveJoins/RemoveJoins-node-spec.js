"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const tests = require("./RemoveJoins");

let server1;
const initServer1 = require("../test-servers/server1/index");

QUnit.module("Select.removeUnnesaryJoins", {
    before: async function() {
        server1 = await initServer1();
    },
    after: async function() {
        await server1.stop();
    }
}, function() {
    tests(() => ({
        server1
    }));
});
