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
        node: "select * from public.company",
        request: {
            columns: ["inn"]
        },
        result: `
            select
                public.company.inn as "inn"
            from public.company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from public.company as company",
        request: {
            columns: ["inn"]
        },
        result: `
            select
                company.inn as "inn"
            from public.company as company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from test.company",
        request: {
            columns: ["is_some"]
        },
        result: `
            select
                test.company.is_some as "is_some"
            from test.company
        `
    });

    testRequest({
        server: () => server,
        node: "select * from test.company as my_company",
        request: {
            columns: ["is_some"]
        },
        result: `
            select
                my_company.is_some as "is_some"
            from test.company as my_company
        `
    });

});
