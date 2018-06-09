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
    
    testInsert({
        server: () => server,
        node: `
            select * from company
        `,
        request: {
            row: {
                name: "Hello",
                inn: "123-4\n",
                id_country: "-15",
                is_client: true
            }
        },
        result: "insert into company (name, inn, id_country, is_client) values ($tag1$Hello$tag1$, $tag1$123-4\n$tag1$, -15, true)"
    });
    
    let testDate = new Date(2018, 0, 1);
    let testDateIso = testDate.toISOString();
    
    testInsert({
        server: () => server,
        node: `
            select * from company
        `,
        request: {
            row: {
                some_date: testDate,
                some_timestamp: testDate
            }
        },
        result: `insert into company (some_date, some_timestamp) values ('${testDateIso}'::date, '${testDateIso}'::timestamp without time zone)`
    });
    
    testInsert({
        server: () => server,
        node: `
            select * from company
        `,
        request: {
            row: {
                some_date: +testDate,
                some_timestamp: +testDate
            }
        },
        result: `insert into company (some_date, some_timestamp) values ('${testDateIso}'::date, '${testDateIso}'::timestamp without time zone)`
    });
    
    testInsert({
        server: () => server,
        node: `
            select * from test.company
        `,
        request: {
            row: {
                is_some: true
            }
        },
        result: "insert into test.company (is_some) values (true)"
    });
});
