"use strict";

const {testRequest} = require("../../utils/init")(__dirname);

describe("UnnesaryJoins", () => {

    testRequest({
        node: `
            select *
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `,
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
        node: `
            select *
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `,
        request: {
            columns: ["id", "CountryStart.name"]
        },
        result: `
            select
                company.id,
                CountryStart.name as "CountryStart.name"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country
        `
    });

    testRequest({
        node: `
            select *
            from company

            left join company as NextCompany on
                NextCompany.id = company.id + 1

            left join country as NextCompanyCountry on
                NextCompanyCountry.id = NextCompany.id_country
        `,
        request: {
            columns: ["id", "NextCompanyCountry.code"]
        },
        result: `
            select
                company.id,
                NextCompanyCountry.code as "NextCompanyCountry.code"
            from company

            left join company as NextCompany on
                NextCompany.id = company.id + 1

            left join country as NextCompanyCountry on
                NextCompanyCountry.id = NextCompany.id_country
        `
    });

});
