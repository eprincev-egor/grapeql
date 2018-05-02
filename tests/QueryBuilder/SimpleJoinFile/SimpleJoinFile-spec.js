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
                "Country".code as "Country.code",
                company.inn as "inn"
            from company

            left join country as "Country" on
                "Country".id = company.id_country
        `
    });

});
