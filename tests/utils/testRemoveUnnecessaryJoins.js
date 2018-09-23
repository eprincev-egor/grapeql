"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");
const {removeUnnecessary} = require("../../src/server/QueryBuilder/removeUnnecessary");

function testRemoveUnnecessaryJoins(getServer, fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {
        let server = getServer();

        server.queryBuilder.clear();
        server.queryBuilder.addFile("Country", "select * from country");

        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        removeUnnecessary({
            select: parsedFromSelect,
            server
        });

        let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);

        assert.ok(isEqual);
    });
}

module.exports = testRemoveUnnecessaryJoins;
