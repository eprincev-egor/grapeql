"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testRequest} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("JoinSelfFile", () => {

    testRequest({
        server: () => server,
        nodes: {
            Country: "select * from country",
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                left join ./Company as ParentCompany on
                    ParentCompany.id = company.id_parent
            `
        },
        node: "Company",
        request: {
            columns: [
                "id", "inn", "Country.code",
                "ParentCompany.id",
                "ParentCompany.inn",
                "ParentCompany.Country.code"
            ]
        },
        result: `
            select
                company.id,
                company.inn,
                Country.code as "Country.code",
                ParentCompany.id as "ParentCompany.id",
                ParentCompany.inn as "ParentCompany.inn",
                "ParentCompany.Country".code as "ParentCompany.Country.code"
            from company

            left join country as Country on
                Country.id = company.id_country

            left join company as ParentCompany
                left join country as "ParentCompany.Country"
                on "ParentCompany.Country".id = ParentCompany.id_country
            on ParentCompany.id = company.id_parent
        `
    });

    /*
    testRequest({
        server: () => server,
        nodes: {
            Country: "select * from country",
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                inner join ./Company as ParentCompany on
                    ParentCompany.id = company.id_parent
            `
        },
        node: "Company",
        request: {
            columns: [
                "id", "inn", "Country.code",
                "ParentCompany.id",
                "ParentCompany.inn",
                "ParentCompany.Country.code"
            ]
        },
        error: true
    });
    */
});
