"use strict";

const config = require("./config");
const GrapeQL = require("../../src/server/GrapeQL");

(async() => {
    let server = await GrapeQL.start(config);
    const Company = server.nodes.Company;

    let rows = await Company.get({
        columns: ["id", "inn", "name"],
        offset: 0,
        limit: 2
    });
    
    console.log(rows);
})();
