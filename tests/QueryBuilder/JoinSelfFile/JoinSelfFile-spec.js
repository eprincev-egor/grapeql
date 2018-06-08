"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {testRequest} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("JoinSelfFile", () => {

    testRequest({
        server: () => server,
        nodes: {
            Country: "select * from country",
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                left join ./Company as ParentCompany on
                    ParentCompany.id = company.id_parent
            `
        },
        node: "Company",
        request: {
            columns: [
                "id", "inn", "Country.code",
                "ParentCompany.id",
                "ParentCompany.inn",
                "ParentCompany.Country.code"
            ]
        },
        result: `
            select
                company.id,
                company.inn,
                Country.code as "Country.code",
                ParentCompany.id as "ParentCompany.id",
                ParentCompany.inn as "ParentCompany.inn",
                "ParentCompany.Country".code as "ParentCompany.Country.code"
            from company

            left join country as Country on
                Country.id = company.id_country

            left join company as ParentCompany
                left join country as "ParentCompany.Country"
                on "ParentCompany.Country".id = ParentCompany.id_country
            on ParentCompany.id = company.id_parent
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Country: "select * from country",
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                inner join ./Company as ParentCompany on
                    ParentCompany.id = company.id_parent
            `
        },
        node: "Company",
        request: {
            columns: [
                "id", "inn", "Country.code",
                "ParentCompany.id",
                "ParentCompany.inn",
                "ParentCompany.Country.code"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Country: "select * from country",
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                left join ./Company as ParentCompany on
                    true
            `
        },
        node: "Company",
        request: {
            columns: [
                "id", "inn", "Country.code",
                "ParentCompany.id",
                "ParentCompany.inn",
                "ParentCompany.Country.code"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from ./Company
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from (select * from ./Company) as company
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from (select * from company left join ./Company on true) as company
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                with x as (
                    select * from ./Company
                )
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                with x as (
                    select * from company as yy
                    inner join ./Company on Company.id = yy.id
                )
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Country: `
                with y as (
                    select count(*)
                    from ./Company
                )
                select *
                from country
            `,
            Company: `
                select * from company
                
                left join ./Country on
                    true
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    testRequest({
        server: () => server,
        nodes: {
            SomeCountry: `
                with z as (
                    select count(*)
                    from ./Company
                )
                select *
                from country
            `,
            Country: `
                select *
                from country
                
                left join ./SomeCountry on
                    true
            `,
            Company: `
                select * from company
                
                left join ./Country on
                    true
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        error: true
    });
    
    
    testRequest({
        server: () => server,
        nodes: {
            Country: `
                with y as (
                    select count(*)
                    from ./Company
                )
                select *
                from country
            `,
            Company: `
                select * from company
                
                left join ./Country on
                    Country.id = company.id_country
            `
        },
        node: "Company",
        request: {
            columns: [
                "id"
            ]
        },
        result: `
            select company.id
            from company
        `
    });
    
});
