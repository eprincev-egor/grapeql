"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const tests = require("./RemoveJoins");

let server1 = require("../test-servers/server1/server-dump.json");

QUnit.module("Select.removeUnnesaryJoins", {}, function() {
    tests(() => ({
        server1
    }));
});
