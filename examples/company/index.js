"use strict";

const config = require("./config");
const GrapeQL = require("../../src/server/GrapeQL");

(async() => {
    let server = await GrapeQL.start(config);
    console.log( server.nodes.Company );
})();
