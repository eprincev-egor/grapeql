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

describe("UnnesaryJoins", () => {

    testRequest({
        server: () => server,
        node: `
            select *
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `,
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
        node: `
            select *
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `,
        request: {
            columns: ["id", "CountryStart.name"]
        },
        result: `
            select
                company.id as "id",
                CountryStart.name as "CountryStart.name"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `
    });

});
