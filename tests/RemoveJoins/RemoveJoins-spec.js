"use strict";

const assert = require("assert");
const pg = require("pg");
const fs = require("fs");
const GrapeQL = require("../../src/server/GrapeQL");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const config = require("./config");
const weakDeepEqual = require("../utils/weakDeepEqual");

const db = new pg.Client( config.db );
let server;


function testRemoveUnnesaryJoins(fromSelect, toSelect) {
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

        parsedFromSelect.removeUnnesaryJoins({server});

        let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);

        assert.ok(isEqual);
    });
}

before(async() => {
    await db.connect();

    let sql = fs.readFileSync( __dirname + "/up.sql" );
    await db.query( sql.toString() );

    server = await GrapeQL.start( config );
});

after(async() => {
    await db.end();
});

describe("RemoveJoins", () => {

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = company.id_country
        `, `
            select from company
    `);

    testRemoveUnnesaryJoins( `
            select from Company

            left join Country on
                country.id = company.id_country
        `, `
            select from Company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = company.id_country and
                true
        `, `
            select from company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = 1
        `, `
            select from company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = (select 1) and
                true
        `, `
            select from company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = (select 1) or
                true
        `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = company.id_country

            where country.id > 3
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join country on
                country.id = company.id_country

            left join company as company2 on
                company2.id_country = country.id

    `);

    testRemoveUnnesaryJoins( `
            select from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

        `, `
            select from public.order as orders
    `);

    testRemoveUnnesaryJoins( `
            select
                partner_link.*
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

    `);

    testRemoveUnnesaryJoins( `
            select
                *
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

    `);

    testRemoveUnnesaryJoins( `
            select
                (company_client.id + partner_link.id_order)
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

    `);

    testRemoveUnnesaryJoins( `
            select
                (company_client.id + partner_link.id_order + some.one)
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

            left join lateral (
                select
                    1 as one
            ) as some on true
    `);

    testRemoveUnnesaryJoins( `
            select
                (company_client.id + partner_link.id_order)
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company

            left join lateral (
                select
                    1 as one
            ) as some on true
        `, `
            select
                (company_client.id + partner_link.id_order)
            from public.order as orders

            left join company as company_client on
                company_client.id = orders.id_company_client

            left join order_partner_link as partner_link on
                partner_link.id_order = orders.id and
                company_client.id = partner_link.id_company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true
        `, `
            select from company
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true

            order by country.id
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true

            group by country.id
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true

            group by cube (company.id, (country.id, 1))
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true

            group by rollup (company.id, (country.id, 1))
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join (select * from country limit 1) as country on true

            group by GROUPING SETS (company.id, country.code)
    `);

    testRemoveUnnesaryJoins( `
            select
                cast( country.id as bigint )
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                company.id in (country.id)
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                company.id between country.id and 2
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                company.id between 1 and country.id
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                (case
                    when country.id is not null
                    then 1
                end) as some
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                (case
                    when true
                    then 1
                    else country.id
                end) as some
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                (case
                    when true
                    then country.id
                end) as some
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                coalesce(1, country.id)
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
            select
                lower(country.code)
            from company

            left join (select * from country limit 1) as country on true
    `);

    testRemoveUnnesaryJoins( `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join company on
            company.id = comp_id.id

        left join lateral (
            select * from (
                select
                    russia_country.id as id_country
                from country as russia_country

                where
                    russia_country.id = 1

            ) as some_table
        ) as some_table on true

    `, `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join lateral (
            select * from (
                select
                    russia_country.id as id_country
                from country as russia_country

                where
                    russia_country.id = 1

            ) as some_table
        ) as some_table on true
    `);

    testRemoveUnnesaryJoins( `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join company on
            company.id = comp_id.id

        left join lateral (
            select * from (
                select
                    russia_country.id as id_country
                from country as russia_country

                where
                    russia_country.id = 1

                union

                select
                    company.id as id_country
            ) as some_table
        ) as some_table on true

    `);

    testRemoveUnnesaryJoins( `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join company on
            company.id = comp_id.id

        left join lateral (
            select * from (
                select
                    russia_country.id as id_country
                from country as russia_country

                where
                    russia_country.id = 1

                union

                select
                    company.id as id_country
            ) as some_table

            limit 1
        ) as some_table on true

    `, `
        select
            comp_id.id
        from (select 1 as id) as comp_id
    `);

    testRemoveUnnesaryJoins( `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join company on
            company.id = comp_id.id

        left join lateral (
            select * from (
                with
                    test as (
                        select
                            company.name
                    )
                select * from test
            ) as some_table
        ) as some_table on true

    `);

    testRemoveUnnesaryJoins( `
        select
            comp_id.id
        from (select 1 as id) as comp_id

        left join company on
            company.id = comp_id.id

        left join lateral (
            select * from (
                with
                    test as (
                        select
                            company.name
                    )
                select * from test
            ) as some_table

            limit 1
        ) as some_table on true

    `, `
        select
            comp_id.id
        from (select 1 as id) as comp_id
    `);

    testRemoveUnnesaryJoins( `
            select from company

            left join public.order as orders on
                orders.id_company_client = company.id

            left join lateral (
                select *
                from country
                where
                    country.id in (
                        orders.id_country_start,
                        orders.id_country_end
                    )
                limit 1
            ) as country on true
        `, `
            select from company

            left join public.order as orders on
                orders.id_company_client = company.id

    `);

    testRemoveUnnesaryJoins( `
        select CountryEnd.id
        from company

        left join country on
            country.id = company.id_country

        left join country as CountryEnd on
            CountryEnd.id = (select country.id)
    `);

    testRemoveUnnesaryJoins( `
        select from company

        left join country on
            country.id = company.id_country

        left join country as CountryEnd on
            CountryEnd.id = (select country.id)
    `, `
        select from company
    `);

    testRemoveUnnesaryJoins( `
        select CountryEnd.id
        from company

        left join country on
            country.id = company.id_country

        left join country as CountryEnd on
            CountryEnd.id = (
                select country.id
                from country
                limit 1
            )
    `, `
        select CountryEnd.id
        from company

        left join country as CountryEnd on
            CountryEnd.id = (
                select country.id
                from country
                limit 1
            )
    `);

    testRemoveUnnesaryJoins( `
        select CountryEnd.id
        from company

        left join country on
            country.id = company.id_country

        left join lateral (
            select *
            from country
        ) as CountryEnd on
            CountryEnd.id = 1
    `, `
        select CountryEnd.id
        from company

        left join lateral (
            select *
            from country
        ) as CountryEnd on
            CountryEnd.id = 1
    `);
});
