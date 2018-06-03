"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");
const {stopServer, startServer} = require("../utils/serverHelpers");

let server;


function testRemoveUnnesaryWiths(fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {

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

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("RemoveWiths", () => {

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                select 1
            )
        select *
        from x1
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                select 1
            )
        select *
        from company
    `, `
        select *
        from company
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                select 1
            ),
            x2 as (
                select *
                from x1
            )
        select *
        from company
    `, `
        select *
        from company
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                select 1
            ),
            x2 as (
                select *
                from x1
            )
        select *
        from company
        left join x2 on true
    `);

    // testRemoveUnnesaryWiths(`
    //     with recursive
    //     	x as (select 1),
    //     	y as (select 2)
    //     select ( select count(*) from x )
    // `, `
    //     with recursive
    //         x as (select 1)
    //     select ( select count(*) from x )
    // `);

});
