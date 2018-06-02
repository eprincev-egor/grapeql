"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testRequest(test) {
    it(test.result, () => {
        let server = test.server();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.options.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;
        let query = node.parsed.build({
            server,
            node,

            columns: request.columns,
            where: request.where,
            orderBy: request.orderBy,
            offset: request.offset,
            limit: request.limit
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
}

function testRequestCount(test) {
    it(test.result, () => {
        let server = test.server();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.options.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;
        let query = node.parsed.buildCount({
            server,
            node,

            columns: request.columns,
            where: request.where,
            orderBy: request.orderBy,
            offset: request.offset,
            limit: request.limit
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
}

module.exports = {
    testRequest,
    testRequestCount
};
