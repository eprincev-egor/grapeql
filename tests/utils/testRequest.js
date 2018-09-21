"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testRequest(getServer, test) {
    let testName = test.result;
    if ( !testName && test.error ) {
        testName = JSON.stringify(test, null, 4);
    }

    it(testName, async() => {
        let server = getServer();
        server.queryBuilder.clear();
        
        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                server.queryBuilder.addFile(name, node);
            }
        }

        if ( test.cache ) {
            for (let i = 0, n = test.cache.length; i < n; i++) {
                let cacheGql = test.cache[i];
                await server.cache.create(cacheGql);
            }
        }

        let node = test.node;

        if ( !/^\w+$/.test(node) ) {
            server.queryBuilder.addFile("Temp", node);
            node = "Temp";
        }

        let request = test.request;

        if ( test.error ) {
            let hasError = false;
            try {
                server.queryBuilder.buildSelect({
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
            let query = server.queryBuilder.buildSelect({
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
