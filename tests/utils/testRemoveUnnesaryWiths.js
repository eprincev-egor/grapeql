"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testRemoveUnnesaryWiths(getServer, fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {
        let server = getServer();
        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        parsedFromSelect.removeUnnesaryWiths({server});

        let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);

        assert.ok(isEqual);
    });
}

module.exports = testRemoveUnnesaryWiths;
