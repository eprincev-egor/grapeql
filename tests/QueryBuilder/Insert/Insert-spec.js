"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testInsert} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("Insert", () => {
    testInsert({
        server: () => server,
        node: `
            select * from country
        `,
        request: {},
        result: "insert into country default values"
    });
    
    testInsert({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            row: {
                name: "Russia",
                code: "ru"
            }
        },
        result: "insert into country (name, code) values ($tag1$Russia$tag1$, $tag1$ru$tag1$)"
    });
});
