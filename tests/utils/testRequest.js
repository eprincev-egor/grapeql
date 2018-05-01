"use strict";

const Query = require("../../src/server/Query");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

module.exports = function testRequest(test) {
    it(test.result, () => {
        let server = test.server();
        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let query = new Query({
            server,
            node,
            request: test.request
        });

        let sql = query.toString();
        let result = GrapeQLCoach.parseEntity( sql );

        let testResult = GrapeQLCoach.parseEntity(test.result);

        let isEqual = !!weakDeepEqual(testResult, result);

        if ( !isEqual ) {
            console.log( sql );
        }

        assert.ok(isEqual);
    });
};
