"use strict";

describe("SimpleNodeFromSomeSchema", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        node: "select * from public.company",
        request: {
            columns: ["inn"]
        },
        result: `
            select
                public.company.inn
            from public.company
        `
    });

    testRequest({
        node: "select * from public.company as company",
        request: {
            columns: ["inn"]
        },
        result: `
            select
                company.inn
            from public.company as company
        `
    });

    testRequest({
        node: "select * from test.company",
        request: {
            columns: ["is_some"]
        },
        result: `
            select
                test.company.is_some
            from test.company
        `
    });

    testRequest({
        node: "select * from test.company as my_company",
        request: {
            columns: ["is_some"]
        },
        result: `
            select
                my_company.is_some
            from test.company as my_company
        `
    });

});
