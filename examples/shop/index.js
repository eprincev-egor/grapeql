"use strict";

const config = require("./grapeql.config");
const GrapeQL = require("../../src/server/GrapeQL");

async function run() {
    await GrapeQL.start(config);
    console.log("started");
}

run();
