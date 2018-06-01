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

describe("SimpleWhere", () => {

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["id", "=", 1]
        },
        result: `
            select
                company.id
            from company
            
            where
                company.id = 1
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["name", "=", 1]
        },
        result: `
            select
                company.id
            from company
            
            where
                company.name = $tag1$1$tag1$
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company
                
                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["country.id", "=", "1"]
        },
        result: `
            select
                company.id
            from company
            
            left join country on
                country.id = company.id_country
            
            where
                country.id = 1
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company
                
                left join country on
                    country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            where: ["country.code", "=", -200]
        },
        result: `
            select
                company.id
            from company
            
            left join country on
                country.id = company.id_country
            
            where
                country.code = $tag1$-200$tag1$
        `
    });
    
    testRequest({
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
            columns: ["id"],
            where: ["country.code", "=", -200]
        },
        result: `
            select
                company.id
            from company
            
            left join country on
                country.id = company.id_country
            
            where
                country.code = $tag1$-200$tag1$
        `
    });

});
