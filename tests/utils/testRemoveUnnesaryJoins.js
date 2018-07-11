"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testRemoveUnnesaryJoins(getServer, fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {
        let server = getServer();

        server.queryManager.clear();
        server.queryManager.addFile("Country", "select * from country");

        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        parsedFromSelect.removeUnnesaryJoins({server});

        let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);

        assert.ok(isEqual);
    });
}

module.exports = testRemoveUnnesaryJoins;
