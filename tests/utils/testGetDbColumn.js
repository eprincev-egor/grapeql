"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testGetDbColumn(getServer, test) {
    it(`
        find ${ test.link } in
        ${ test.node }
    `, () => {
        let server = getServer();
        let coach;

        coach = new GrapeQLCoach(test.link.trim());
        let link = coach.parseObjectLink();

        if ( test.error ) {
            try {
                coach = new GrapeQLCoach(test.node.trim());
                let select = coach.parseSelect();

                select.getColumnSource({
                    server, link
                });

                assert.ok(false, `expected error ${ test.link } in
                         ${ test.node }`);
            } catch(err) {
                assert.ok(true, `expected error ${ test.link } in
                         ${ test.node }`);
            }
        } else {
            coach = new GrapeQLCoach(test.node.trim());
            let select = coach.parseSelect();

            let source = select.getColumnSource({
                server, link
            });

            let testSource = test.source;
            if ( typeof testSource == "function" ) {
                testSource = testSource(server);
            }

            let isEqual = !!weakDeepEqual(testSource, source);

            assert.ok(isEqual);
        }
    });
}

module.exports = testGetDbColumn;
