"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
const config = require("./config");
const testRequest = require("./utils/testRequest");

let server;
(async function() {
    server = await GrapeQL.start(config);
    console.log( server );
    console.log( GrapeQL );
    console.log( GrapeQLCoach );
    console.log( testRequest );
})();


setInterval(() => {}, 100000);
