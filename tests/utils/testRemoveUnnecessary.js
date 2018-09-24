"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const {removeUnnecessary} = require("../../src/server/QueryBuilder/removeUnnecessary");

function testRemoveUnnecessary(getServer, fromSelect, toSelect) {
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
        
        if ( !isEqual ) {
            console.log(parsedFromSelect.toString());
        }

        assert.ok(isEqual);
    });
}

module.exports = testRemoveUnnecessary;
