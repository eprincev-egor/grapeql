"use strict";

const {testRequest} = require("../../utils/init")(__dirname);

describe("AddWith", () => {

    testRequest({
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

    testRequest({
        nodes: {
            Company: `
                with country (id, code) as (
                    values
                        (1, 'ru'),
                        (2, 'en')
                )
                select *
                from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["inn", "country.code"]
        },
        result: `
            with country (id, code) as (
                values
                    (1, 'ru'),
                    (2, 'en')
            )
            select
                company.inn,
                country.code as "country.code"
            from company

            left join country on
                country.id = company.id_country
        `
    });

    testRequest({
        nodes: {
            Company: `
                with country (id, code) as (
                    values
                        (1, 'ru'),
                        (2, 'en')
                )
                select *
                from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["inn", "country.code"],
            where: ["country.code", "=", "ru"]
        },
        result: `
            with country (id, code) as (
                values
                    (1, 'ru'),
                    (2, 'en')
            )
            select
                company.inn,
                country.code as "country.code"
            from company

            left join country on
                country.id = company.id_country

            where
                country.code = $tag1$ru$tag1$
        `
    });

});
