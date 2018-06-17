"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testDelete} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("Delete", () => {
    testDelete({
        server: () => server,
        node: `
            select * from country
        `,
        request: {},
        result: "delete from country"
    });

    testDelete({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            where: ["id", "=", 4]
        },
        result: "delete from country where id = 4"
    });

    testDelete({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            where: ["code", "=", "ru"]
        },
        result: "delete from country where code = $tag1$ru$tag1$"
    });

    testDelete({
        server: () => server,
        node: `
            select * from test.company
        `,
        request: {
            where: ["id", "=", 4]
        },
        result: "delete from test.company where id = 4"
    });
});
