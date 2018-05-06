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

describe("DefinedColumns", () => {

    testRequest({
        server: () => server,
        node: `
            select *,
                company.id + 1 as id_plus_1
            from company
        `,
        request: {
            columns: ["id_plus_1"]
        },
        result: `
            select
                company.id + 1 as "id_plus_1"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *,
                public.company.id
            from company
        `,
        request: {
            columns: ["id"]
        },
        result: `
            select
                public.company.id
            from company
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *,
                public.company.id
            from company
        `,
        request: {
            columns: ["Id"]
        },
        result: `
            select
                public.company.id as "Id"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *,
                public.company.ID
            from company
        `,
        request: {
            columns: ["Id"]
        },
        result: `
            select
                public.company.ID as "Id"
            from company
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *,
                public.company.id as "my_company.id"
            from company
        `,
        request: {
            columns: ["my_company.id"]
        },
        result: `
            select
                public.company.id as "my_company.id"
            from company
        `
    });

});
