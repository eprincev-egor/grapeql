"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testRequestIndexOf} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("IndexOf", () => {

    testRequestIndexOf({
        server: () => server,
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            row: ["id", "=", 150],
            where: ["id", ">", 50]
        },
        result: `
            select
                query.grapeql_row_index as index
            from (
                select
                    company.id,
                    row_number() over() as grapeql_row_index
                from company

                where
                    company.id > 50
            ) as query
            where
                query."id" = 150
        `
    });

    testRequestIndexOf({
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
            row: ["country.code", "=", 1],
            where: ["id", ">", 50]
        },
        result: `
            select
                query.grapeql_row_index as index
            from (
                select
                    country.code as "country.code",
                    row_number() over() as grapeql_row_index
                from company

                left join country on
                    country.id = company.id_country

                where
                    company.id > 50
            ) as query
            where
                query."country.code" = $tag1$1$tag1$
        `
    });

});
