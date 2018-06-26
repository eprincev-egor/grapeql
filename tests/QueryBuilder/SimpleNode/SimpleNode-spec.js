"use strict";

const {testRequest} = require("../../utils/init")(__dirname);

describe("SimpleNode", () => {
    testRequest({
        node: "select * from company",
        request: {
            columns: ["id"]
        },
        result: `
            select
                company.id
            from company
        `
    });

    testRequest({
        node: "select * from company",
        request: {
            columns: ["Id"]
        },
        result: `
            select
                company.Id
            from company
        `
    });

    testRequest({
        node: "select * from company",
        request: {
            columns: ["id", "name"]
        },
        result: `
            select
                company.id,
                company.name
            from company
        `
    });

    testRequest({
        node: "select * from company",
        request: {
            columns: ["id", "name"],
            offset: 0,
            limit: "all"
        },
        result: `
            select
                company.id,
                company.name
            from company
        `
    });

    testRequest({
        node: "select * from Company",
        request: {
            columns: ["id"]
        },
        result: `
            select
                Company.id
            from Company
        `
    });

    testRequest({
        node: "select * from Company",
        request: {
            columns: ["iD"]
        },
        result: `
            select
                Company.iD
            from Company
        `
    });

    testRequest({
        node: "select * from company",
        request: {
            columns: ["id", "name"],
            offset: 10,
            limit: 20
        },
        result: `
            select
                company.id,
                company.name
            from company

            offset 10
            limit 20
        `
    });
});
