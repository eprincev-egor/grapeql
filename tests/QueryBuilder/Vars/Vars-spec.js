"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const {
    testRequest,
    testRequestCount,
    testRequestIndexOf
} = require("../../utils/testRequest");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("Vars", () => {

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: 1
            }
        },
        result: `
            select
                company.id
            from company

            where
                id = 1
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: null
            }
        },
        error: Error
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: undefined
            }
        },
        error: Error
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $company_id bigint;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: "undefined"
            }
        },
        error: Error
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $company_id bigint;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: undefined
            }
        },
        result: `
            select
                company.id
            from company

            where
                id = null
        `
    });

    testRequestCount({
        server: () => server,
        nodes: {
            Company: `
                declare $inn text;
                select * from company
                where inn = $inn
            `
        },
        node: "Company",
        request: {
            vars: {
                $inn: "1234"
            }
        },
        result: `
            select
                count(*) as count
            from company
            where inn = $tag1$1234$tag1$
        `
    });

    testRequestIndexOf({
        server: () => server,
        nodes: {
            Company: `
                declare $id_country integer;
                select * from company
                where
                    id_country = $id_country
            `
        },
        node: "Company",
        request: {
            row: ["id", "=", 150],
            vars: {
                $id_country: 1
            }
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
                    id_country = 1
            ) as query
            where
                query."id" = 150
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            with vars as (
                select
                    false as some_bool
            )
            
            select
                company.id
            from company

            where
                (select some_bool from vars)
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                
                with vars as (
                    select
                        'lol' as some_bool
                )
                select * from company
                
                left join vars on true
                
                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id", "vars.some_bool"]
        },
        result: `
            with 
                vars as (
                    select
                        'lol' as some_bool
                ),
                vars1 as (
                    select
                        false as some_bool
                )
            
            select
                company.id,
                vars.some_bool as "vars.some_bool"
            from company
            
            left join vars on true
            
            where
                (select some_bool from vars1)
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $some_bool: true
            }
        },
        result: `
            select
                company.id
            from company

            where
                true
        `
    });
    
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $some_bool: "some"
            }
        },
        error: Error
    });

});
