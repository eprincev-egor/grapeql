"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testUpdate(getServer, test) {
    it(test.result, () => {
        let server = getServer();

        let name = "Tmp";
        server.queryManager.clear();
        server.queryManager.addFile(name, test.node);

        let request = test.request;
        let query = server.queryManager.buildUpdate({
            node: name,

            set: request.set,
            where: request.where
        });

        let sql = query.toString();
        let result = GrapeQLCoach.parseUpdate( sql );

        let testResult = GrapeQLCoach.parseUpdate(test.result);

        let isEqual = !!weakDeepEqual(testResult, result);

        if ( !isEqual ) {
            console.log( sql );
        }

        assert.ok(isEqual);

        assert.equal(query, test.result);
    });
}

module.exports = testUpdate;
