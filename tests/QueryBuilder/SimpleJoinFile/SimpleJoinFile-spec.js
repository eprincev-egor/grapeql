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

describe("SimpleJoinFile", () => {

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {
            columns: ["Country.code", "inn"]
        },
        result: `
            select
                Country.code as "Country.code",
                company.inn
            from company

            left join country as Country on
                Country.id = company.id_country
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country as CountryStart on
                    CountryStart.id = company.id_country

                left join ./Country as CountryEnd on
                    CountryEnd.id = company.id_country
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {
            columns: ["CountryStart.code", "CountryEnd.code"]
        },
        result: `
            select
                CountryStart.code as "CountryStart.code",
                CountryEnd.code as "CountryEnd.code"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country

            left join country as CountryEnd on
                CountryEnd.id = company.id_country
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Order: `
                select * from public.order

                left join ./Company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
            `,
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Order",
        request: {
            columns: ["id", "CompanyClient.Country.code"]
        },
        result: `
            select
                public.order.id,
                CompanyClient.Country.code as "CompanyClient.Country.code"
            from public.order

            left join company as CompanyClient on
                CompanyClient.id = public.order.id_company_client

            left join country as CompanyClient.Country on
                CompanyClient.Country.id = CompanyClient.id_country
        `
    });

});
