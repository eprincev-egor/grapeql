"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const testRequest = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("SimpleOrderBy", () => {

    testRequest({
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
        server: () => server,
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
