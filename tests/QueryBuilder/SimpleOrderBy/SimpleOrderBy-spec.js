"use strict";

describe("SimpleOrderBy", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            orderBy: "id"
        },
        result: `
            select
                company.id
            from company

            order by company.id asc
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
            orderBy: ["id"]
        },
        result: `
            select
                company.id
            from company

            order by company.id asc
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
            orderBy: ["id", "asc"]
        },
        result: `
            select
                company.id
            from company

            order by company.id asc
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
            orderBy: ["id", "desc"]
        },
        result: `
            select
                company.id
            from company

            order by company.id desc
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
            orderBy: [["id", "desc"]]
        },
        result: `
            select
                company.id
            from company

            order by company.id desc
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
            orderBy: ["country.id", "desc"]
        },
        result: `
            select
                company.id
            from company

            left join country on
                country.id = company.id_country

            order by country.id desc
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
            orderBy: ["country.code", "desc"]
        },
        result: `
            select
                company.id
            from company

            left join country on
                country.id = company.id_country

            order by country.code desc
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company
                order by company.inn desc
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            orderBy: [["name", "desc"], ["id", "asc"]]
        },
        result: `
            select
                company.id
            from company

            order by
                company.name desc,
                company.id asc,
                company.inn desc
        `
    });
});
