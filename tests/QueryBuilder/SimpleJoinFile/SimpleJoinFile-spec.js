"use strict";

describe("SimpleJoinFile", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {
            columns: ["Country.code", "inn"]
        },
        result: `
            select
                Country.code as "Country.code",
                company.inn
            from company

            left join country as Country on
                Country.id = company.id_country
        `
    });

    testRequest({
        nodes: {
            Company: `
                select * from company

                left join ./Country as CountryStart on
                    CountryStart.id = company.id_country

                left join ./Country as CountryEnd on
                    CountryEnd.id = company.id_country
            `,
            Country: `
                select * from country
            `
        },
        node: "Company",
        request: {
            columns: ["CountryStart.code", "CountryEnd.code"]
        },
        result: `
            select
                CountryStart.code as "CountryStart.code",
                CountryEnd.code as "CountryEnd.code"
            from company

            left join country as CountryStart on
                CountryStart.id = company.id_country

            left join country as CountryEnd on
                CountryEnd.id = company.id_country
        `
    });

    testRequest({
        nodes: {
            Order: `
                select * from public.order

                left join ./Company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
            `,
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Order",
        request: {
            columns: ["id", "CompanyClient.country.code"]
        },
        result: `
            select
                public.order.id,
                "CompanyClient.country".code as "CompanyClient.country.code"
            from public.order

            left join company as CompanyClient
                left join country as "CompanyClient.country"
                on "CompanyClient.country".id = CompanyClient.id_country

            on CompanyClient.id = public.order.id_company_client
        `
    });

    testRequest({
        nodes: {
            Order: `
                select * from public.order

                left join ./Company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
            `,
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Order",
        request: {
            columns: ["id", "CompanyClient.Country.code"]
        },
        result: `
            select
                public.order.id,
                "CompanyClient.country".code as "CompanyClient.Country.code"
            from public.order

            left join company as CompanyClient
                left join country as "CompanyClient.country"
                on "CompanyClient.country".id = CompanyClient.id_country

            on CompanyClient.id = public.order.id_company_client
        `
    });

    testRequest({
        nodes: {
            Order: `
                select
                    *,
                    CompanyClient.inn as client_inn
                from public.order

                left join ./Company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
            `,
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Order",
        request: {
            columns: ["id", "client_inn"]
        },
        result: `
            select
                public.order.id,
                CompanyClient.inn as "client_inn"
            from public.order

            left join company as CompanyClient on
                CompanyClient.id = public.order.id_company_client
        `
    });

    testRequest({
        nodes: {
            Order: `
                select
                    *,
                    CompanyClient.inn as client_inn
                from public.order

                left join ./Company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client

                where
                    CompanyClient.Country.code is not null
            `,
            Company: `
                select * from company

                left join country on
                    country.id = company.id_country
            `
        },
        node: "Order",
        request: {
            columns: ["id", "client_inn"]
        },
        result: `
            select
                public.order.id,
                CompanyClient.inn as "client_inn"
            from public.order

            left join company as CompanyClient
                left join country as "CompanyClient.country"
                on "CompanyClient.country".id = CompanyClient.id_country
            on CompanyClient.id = public.order.id_company_client



            where
                "CompanyClient.country".code is not null
        `
    });

});
