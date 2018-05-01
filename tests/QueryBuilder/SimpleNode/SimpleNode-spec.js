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

describe("Builder", () => {
    testRequest({
        server: () => server,
        node: "select * from company",
        request: {
            columns: ["id"]
        },
        result: `
            select
                company.id as "id"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from company",
        request: {
            columns: ["Id"]
        },
        result: `
            select
                company.id as "Id"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from company",
        request: {
            columns: ["id", "name"]
        },
        result: `
            select
                company.id as "id",
                company.name as "name"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from company",
        request: {
            columns: ["id", "name"],
            offset: 0,
            limit: "all"
        },
        result: `
            select
                company.id as "id",
                company.name as "name"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from Company",
        request: {
            columns: ["id"]
        },
        result: `
            select
                Company.id as "id"
            from Company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from Company",
        request: {
            columns: ["iD"]
        },
        result: `
            select
                Company.id as "iD"
            from Company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from company",
        request: {
            columns: ["id", "name"],
            offset: 10,
            limit: 20
        },
        result: `
            select
                company.id as "id",
                company.name as "name"
            from company

            offset 10
            limit 20
        `
    });
});
