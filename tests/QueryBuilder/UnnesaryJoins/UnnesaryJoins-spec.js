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

    testRequest({
        server: () => server,
        node: `
            select *
            from company

            left join company as NextCompany on
                NextCompany.id = company.id + 1

            left join country as NextCompanyCountry on
                NextCompanyCountry.id = NextCompany.id_country
        `,
        request: {
            columns: ["id", "NextCompanyCountry.code"]
        },
        result: `
            select
                company.id as "id",
                NextCompanyCountry.code as "NextCompanyCountry.code"
            from company

            left join company as NextCompany on
                NextCompany.id = company.id + 1

            left join country as NextCompanyCountry on
                NextCompanyCountry.id = NextCompany.id_country
        `
    });

});
