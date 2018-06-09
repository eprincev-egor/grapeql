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
            limit: 10
        },
        result: "delete from country limit 10"
    });
    
    testDelete({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            offset: 10
        },
        result: "delete from country offset 10"
    });
    
    testDelete({
        server: () => server,
        node: `
            select * from country
        `,
        request: {
            offset: 10,
            limit: 20
        },
        result: "delete from country offset 10 limit 20"
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
            where: ["code", "=", "ru"],
            offset: 2,
            limit: 5
        },
        result: "delete from country where code = $tag1$ru$tag1$ offset 2 limit 5"
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
