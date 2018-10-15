"use strict";

describe("FromFileInSubQuery", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select
                    *,
                    (select code from ./Country where id = 1) as first_country_code
                from company
            `
        },
        node: "Company",
        request: {
            columns: ["first_country_code"]
        },
        result: `
            select
                (select code from country as Country where id = 1) as "first_country_code"
            from company
        `
    });

    testRequest({
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select *
                from company
                where
                    'ru' = (select code from ./Country where id = 1)
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
            where
                'ru' = (select code from country as Country where id = 1)
        `
    });

    testRequest({
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select *
                from company

                left join country on
                    country.id = (select id from ./Country limit 1)
            `
        },
        node: "Company",
        request: {
            columns: ["id", "country.id"]
        },
        result: `
            select
                company.id,
                country.id as "country.id"
            from company

            left join country on
                country.id = (select id from country as Country limit 1)
        `
    });

    testRequest({
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select *
                from company

                left join (select * from ./Country) as country on
                    country.id = 1
            `
        },
        node: "Company",
        request: {
            columns: ["id", "country.id"]
        },
        result: `
            select
                company.id,
                country.id as "country.id"
            from company

            left join (select id from country as Country) as country on
                country.id = 1
        `
    });

    testRequest({
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select *
                from company

                left join lateral (select * from ./Country) as country on
                    country.id = 1
            `
        },
        node: "Company",
        request: {
            columns: ["id", "country.id"]
        },
        result: `
            select
                company.id,
                country.id as "country.id"
            from company

            left join lateral (select id from country as Country) as country on
                country.id = 1
        `
    });

});
