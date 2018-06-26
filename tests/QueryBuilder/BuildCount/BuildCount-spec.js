"use strict";

const {testRequestCount} = require("../../utils/init")(__dirname);

describe("BuildCount", () => {

    testRequestCount({
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company
                inner join country on true
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company
            inner join country on true
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company

                left join country on true
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company

            left join country on true
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country

                order by country.code desc
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company

                left join ./Country as country on
                    country.id = company.id_country

                order by country.code desc
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                select * from company

                left join ./Country as country on
                    country.id = company.id_country

                where country.code is not null
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {},
        result: `
            select
                count(*) as count
            from company

            left join country on
                country.id = company.id_country

            where country.code is not null
        `
    });

});
