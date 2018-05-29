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

describe("FromFile", () => {
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `,
            Client: `
                select * from ./Company
                where Company.is_client
            `
        },
        node: "Client",
        request: {
            columns: ["country.code"]
        },
        result: `
            select
                country.code as "country.code"
            from company as Company

            left join country on
                country.id = Company.id_country

            where Company.is_client
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `,
            SomeQuery: `
                select *
                from
                    ./Company as Client,
                    ./Company as NotClient

                where
                    Client.is_client and
                    not NotClient.is_client
            `
        },
        node: "SomeQuery",
        request: {
            columns: ["NotClient.country.code"]
        },
        result: `
            select
                "NotClient.country".code as "NotClient.country.code"
            from
                company as Client,
                company as NotClient

                left join country as "NotClient.country" on
                    "NotClient.country".id = NotClient.id_country

            where
                Client.is_client and
                not NotClient.is_client
        `
    });
});
