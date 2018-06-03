"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testRequest} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("AddWith", () => {

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Country: `
                with
                    all_codes as (
                        select
                            string_agg(distinct country.code) as codes
                        from country
                    )

                select *
                from country

                left join all_codes on true
            `
        },
        node: "Company",
        request: {
            columns: ["id", "Country.all_codes.codes"]
        },
        result: `
            with
                "Country.all_codes" as (
                    select
                        string_agg(distinct country.code) as codes
                    from country
                )
            select
                company.id,
                "Country.all_codes".codes as "Country.all_codes.codes"
            from company

            left join country as Country
                left join "Country.all_codes" on true
            on Country.id = company.id_country
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                with
                    all_inn as (
                        select
                            string_agg(distinct company.inn) as inn_agg
                        from company
                    )
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                left join all_inn on true
            `,
            Country: `
                with
                    all_codes as (
                        select
                            string_agg(distinct country.code) as codes
                        from country
                    )

                select *
                from country

                left join all_codes on true
            `
        },
        node: "Company",
        request: {
            columns: ["id", "Country.all_codes.codes", "all_inn.inn_agg"]
        },
        result: `
            with
                all_inn as (
                    select
                        string_agg(distinct company.inn) as inn_agg
                    from company
                ),
                "Country.all_codes" as (
                    select
                        string_agg(distinct country.code) as codes
                    from country
                )
            select
                company.id,
                "Country.all_codes".codes as "Country.all_codes.codes",
                all_inn.inn_agg as "all_inn.inn_agg"
            from company

            left join country as Country
                left join "Country.all_codes" on true
            on Country.id = company.id_country

            left join all_inn on true
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Country: `
                with nice as (
                    select
                        'nice' as str,
                        1 as id_country
                )

                select * from country

                left join nice on
                    country.id = nice.id_country
            `,
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Order: `
                select *
                from public.order

                left join ./Company on
                    Company.id = public.order.id_company_client
            `
        },
        node: "Order",
        request: {
            columns: ["Company.Country.nice.str"]
        },
        result: `
            with
                "Company.Country.nice" as (
                    select
                        'nice' as str,
                        1 as id_country
                )
            select
                "Company.Country.nice".str as "Company.Country.nice.str"
            from public.order

            left join company as Company
                left join country as "Company.Country"
                    left join "Company.Country.nice" as "Company.Country.nice"
                    on "Company.Country".id = "Company.Country.nice".id_country
                on "Company.Country".id = Company.id_country
            on Company.id = public.order.id_company_client
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Country: `
                with
                    all_codes as (
                        select
                            string_agg(distinct country.code) as codes
                        from country
                    )

                select *
                from country

                left join all_codes on true
            `
        },
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            select
                company.id
            from company
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Country: `
                with recursive
                    all_codes as (
                        select
                            string_agg(distinct country.code) as codes
                        from country
                    )

                select *
                from country

                left join all_codes on true
            `
        },
        node: "Company",
        request: {
            columns: ["inn", "Country.all_codes.codes"]
        },
        result: `
            with recursive
                "Country.all_codes" as (
                    select
                        string_agg(distinct country.code) as codes
                    from country
                )
            select
                company.inn,
                "Country.all_codes".codes as "Country.all_codes.codes"
            from company

            left join country as Country
                left join "Country.all_codes" on true
            on Country.id = company.id_country
        `
    });

});
