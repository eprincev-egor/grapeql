"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testRequest(getServer, test) {
    let testName = test.result;
    if ( !testName && test.error ) {
        testName = JSON.stringify(test, null, 4);
    }

    it(testName, () => {
        let server = getServer();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;

        if ( test.error ) {
            let hasError = false;
            try {
                node.parsed.buildSelect({
                    server,
                    node,

                    columns: request.columns,
                    where: request.where,
                    orderBy: request.orderBy,
                    offset: request.offset,
                    limit: request.limit,
                    vars: request.vars
                });
            } catch(err) {
                hasError = true;
            }
            assert.ok(hasError, "expected error");
        } else {
            let query = node.parsed.buildSelect({
                server,
                node,

                columns: request.columns,
                where: request.where,
                orderBy: request.orderBy,
                offset: request.offset,
                limit: request.limit,
                vars: request.vars
            });

            let sql = query.toString();
            let result = GrapeQLCoach.parseSelect( sql );

            let testResult = GrapeQLCoach.parseSelect(test.result);

            let isEqual = !!weakDeepEqual(testResult, result);

            if ( !isEqual ) {
                console.log( sql );
            }

            assert.ok(isEqual);
        }
    });
}


module.exports = testRequest;
