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

describe("ManyFroms", () => {

    testRequest({
        server: () => server,
        node: `
            select *
            from company, country
        `,
        request: {
            columns: ["country.code"]
        },
        result: `
            select
                country.code as "country.code"
            from company, country
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *
            from company, country
        `,
        request: {
            columns: ["company.inn"]
        },
        result: `
            select
                company.inn as "company.inn"
            from company, country
        `
    });

    testRequest({
        server: () => server,
        node: `
            select *
            from company

            left join country on
                country.id = company.id_country
        `,
        request: {
            columns: ["country.code"]
        },
        result: `
            select
                country.code as "country.code"
            from company

            left join country on
                country.id = company.id_country
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
            columns: ["CountryStart.code"]
        },
        result: `
            select
                CountryStart.code as "CountryStart.code"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `
    });

});
