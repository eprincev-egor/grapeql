"use strict";

describe("ManyFroms", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        node: `
            select *
            from company, country
        `,
        request: {
            columns: ["country.code"]
        },
        result: `
            select
                country.code as "country.code"
            from company, country
        `
    });

    testRequest({
        node: `
            select *
            from company, country
        `,
        request: {
            columns: ["company.inn"]
        },
        result: `
            select
                company.inn as "company.inn"
            from company, country
        `
    });

    testRequest({
        node: `
            select *
            from company

            left join country on
                country.id = company.id_country
        `,
        request: {
            columns: ["country.code"]
        },
        result: `
            select
                country.code as "country.code"
            from company

            left join country on
                country.id = company.id_country
        `
    });

    testRequest({
        node: `
            select *
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `,
        request: {
            columns: ["CountryStart.code"]
        },
        result: `
            select
                CountryStart.code as "CountryStart.code"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `
    });

});
