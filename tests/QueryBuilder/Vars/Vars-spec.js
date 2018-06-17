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

});
