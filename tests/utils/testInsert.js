"use strict";

// const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
// const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");


function testInsert(getServer, test) {
    it(test.result, () => {
        let server = getServer();

        let node = test.node;
        let name = "Tmp";
        node = server.addNode(name, node);
        node.file = "./" + name + ".sql";

        let request = test.request;
        let query = node.parsed.buildInsert({
            server,
            node,

            row: request.row
        });

        assert.equal(query, test.result);
    });
}

module.exports = testInsert;
