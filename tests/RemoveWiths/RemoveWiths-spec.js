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

    testRemoveUnnesaryWiths(`
        with recursive
        	x as (select 1),
        	y as (select 2)
        select ( select count(*) from x )
    `, `
        with recursive
            x as (select 1)
        select ( select count(*) from x )
    `);

    testRemoveUnnesaryWiths(`
        with recursive
        	x as (select 1),
        	y as (select 2)
        select *
        from company
        order by (select * from y ) desc
    `, `
        with recursive
            y as (select 2)
        select *
        from company
        order by (select * from y ) desc
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        group by (select id from x)
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        group by cube (company.id, ((select id from x), 1))
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        group by rollup (company.id, ((select id from x), 1))
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        group by GROUPING SETS (company.id, (select id from x))
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        left join lateral (
            select *
            from x
        ) as y on true
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from company
        left join (
            select *
            from x
        ) as y on true
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from (
            select *
            from x
        ) as y
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from test_func(
            (select *
            from x)
        ) as y
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select from (
            select *
            from test_func(
                (select *
                from x)
            ) as y
        ) as a
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select test_func(
            (select *
            from x)
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select string_agg(
            company.name
            order by (select id from x)
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select string_agg(
            company.name
        ) within group (
            order by company.id desc, (select id from x)
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select string_agg(
            company.name
        ) filter (
            where
                company.id > (select id from x)
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select row_number() over (
            order by (select id from x) desc
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select row_number() over (
            partition by (select id from x)
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select cast( (select id from x) as bigint )
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select company.id in ((select id from x), (select id + 1 from x))
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select company.id in (select id from x)
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select company.id between 1 and (select id + 100 from x)
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select company.id between (select id from x) and 500
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select case
            when (select id from x)
            then 1
        end
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select case
            when true
            then (select id from x)
        end
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select case
            when true
            then 1
            else (select id from x)
        end
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select row_number() over (
            order by (select id from x) desc
        )
        from company
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select row_number() over (test_2)
        from company
        window
            test_1 as (partition by company.inn),
            test_2 as (partition by (select id from x))
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1 as id)
        select row_number() over (test_2)
        from company
        window
            test_1 as (partition by company.inn),
            test_2 as (order by (select id from x) asc)
    `);

    testRemoveUnnesaryWiths( `
        with x as (select 1)
        select * from (
            with x as (select 2)
            select * from x
        ) as test
    `, `
        select * from (
            with x as (select 2)
            select * from x
        ) as test
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    (5, 6)
            )
        select *
        from x1
    `, `
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x1
    `, `
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x3
    `, `
        with
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x3
    `);

    testRemoveUnnesaryWiths(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x2
    `, `
        with
            x2 as (
                values
                    (3, 4)
            )
        select *
        from x2
    `);
});
