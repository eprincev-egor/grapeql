"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testRequestCount(getServer,test) {
    it(test.result, () => {
        let server = getServer();
        server.queryBuilder.clear();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                server.queryBuilder.addFile(name, node);
            }
        }

        let node = test.node;

        if ( !/^\w+$/.test(node) ) {
            server.queryBuilder.addFile("Temp", node);
            node = "Temp";
        }

        let request = test.request;
        let query = server.queryBuilder.buildCount({
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
    });
}

module.exports = testRequestCount;
