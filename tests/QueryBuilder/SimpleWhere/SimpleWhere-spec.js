"use strict";

const {testRequest} = require("../../utils/init")(__dirname);

describe("SimpleWhere", () => {

    testRequest({
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["id", "=", 1]
        },
        result: `
            select
                company.id
            from company

            where
                company.id = 1
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["name", "=", 1]
        },
        result: `
            select
                company.id
            from company

            where
                company.name = $tag1$1$tag1$
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["country.id", "=", "1"]
        },
        result: `
            select
                company.id
            from company

            left join country on
                country.id = company.id_country

            where
                country.id = 1
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["country.code", "=", -200]
        },
        result: `
            select
                company.id
            from company

            left join country on
                country.id = company.id_country

            where
                country.code = $tag1$-200$tag1$
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company

                left join ./Country as country on
                    country.id = company.id_country
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["country.code", "=", -200]
        },
        result: `
            select
                company.id
            from company

            left join country on
                country.id = company.id_country

            where
                country.code = $tag1$-200$tag1$
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company
                where company.id > 100 or company.inn is not null
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["id", "=", 1]
        },
        result: `
            select
                company.id
            from company

            where
                (company.id > 100 or company.inn is not null) and
                company.id = 1
        `
    });

});
