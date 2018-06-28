"use strict";

describe("DefinedColumns", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        node: `
            select *,
                company.id + 1 as id_plus_1
            from company
        `,
        request: {
            columns: ["id_plus_1"]
        },
        result: `
            select
                company.id + 1 as "id_plus_1"
            from company
        `
    });

    testRequest({
        node: `
            select *,
                public.company.id
            from company
        `,
        request: {
            columns: ["id"]
        },
        result: `
            select
                public.company.id
            from company
        `
    });

    testRequest({
        node: `
            select *,
                public.company.id
            from company
        `,
        request: {
            columns: ["Id"]
        },
        result: `
            select
                public.company.id as "Id"
            from company
        `
    });

    testRequest({
        node: `
            select *,
                public.company.ID
            from company
        `,
        request: {
            columns: ["Id"]
        },
        result: `
            select
                public.company.ID as "Id"
            from company
        `
    });

    testRequest({
        node: `
            select *,
                public.company.id as "my_company.id"
            from company
        `,
        request: {
            columns: ["my_company.id"]
        },
        result: `
            select
                public.company.id as "my_company.id"
            from company
        `
    });

});
