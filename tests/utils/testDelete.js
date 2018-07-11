"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testDelete(getServer, test) {
    it(test.result, () => {
        let server = getServer();

        let name = "Tmp";
        server.queryManager.clear();
        server.queryManager.addFile(name, test.node);

        let request = test.request;
        let query = server.queryManager.buildDelete({
            node: name,

            where: request.where,
            offset: request.offset,
            limit: request.limit
        });

        let sql = query.toString();
        let result = GrapeQLCoach.parseDelete( sql );

        let testResult = GrapeQLCoach.parseDelete(test.result);

        let isEqual = !!weakDeepEqual(testResult, result);

        if ( !isEqual ) {
            console.log( sql );
        }

        assert.ok(isEqual);

        assert.equal(query, test.result);
    });
}

module.exports = testDelete;
