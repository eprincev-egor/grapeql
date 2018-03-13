"use strict";

const CompanyTests = require("./tests/Company");
const OrderTests = require("./tests/Order");

module.exports = function(getServers) {
    CompanyTests(getServers);
    OrderTests(getServers);
};
