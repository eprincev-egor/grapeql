"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testUpdate} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("Update", () => {
    testUpdate({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            set: {
                code: "ru"
            },
            where: ["id", "=", 1]
        },
        result: "update country set code = $tag1$ru$tag1$ where country.id = 1"
    });
});
