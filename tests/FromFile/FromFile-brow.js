"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const tests = require("./FromFile");

let SERVER_1 = require("../test-servers/server1/server-dump.json");

QUnit.module("Select.buildFromFiles", {}, function() {
    tests(SERVER_1);
});
