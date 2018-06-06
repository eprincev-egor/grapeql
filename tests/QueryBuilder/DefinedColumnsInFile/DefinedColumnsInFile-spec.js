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

describe("DefinedColumnsInFile", () => {
    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select
                    *,
                    company.id + 1 as id_plus
                from company
            `,
            Order: `
                select * from public.order

                left join ./Company on
                    Company.id = public.order.id_company_client
            `
        },
        node: "Order",
        request: {
            columns: ["id", "Company.id_plus"]
        },
        result: `
            select
                public.order.id,
                Company.id + 1 as "Company.id_plus"
            from public.order

            left join company as Company on
                Company.id = public.order.id_company_client
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Country: `
                select
                    *,
                    (
                        select count(company.id)
                        from company
                        where
                            company.id_country = country.id
                    ) as "company_count"
                from country
            `,
            Company: `
                select
                    *,
                    company.id + 1 as id_plus
                from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Order: `
                select
                    *,
                    'hello company, public.order, country' as "hello"
                from public.order

                left join ./Company on
                    Company.id = public.order.id_company_client
            `
        },
        node: "Order",
        request: {
            columns: ["id", "hello", "Company.id_plus", "Company.Country.company_count"]
        },
        result: `
            select
                public.order.id,
                'hello company, public.order, country' as "hello",
                Company.id + 1 as "Company.id_plus",
                (
                    select count(company.id)
                    from company
                    where
                        company.id_country = "Company.Country".id
                ) as "Company.Country.company_count"
            from public.order

            left join company as Company
                left join country as "Company.Country"
                on "Company.Country".id = Company.id_country
            on Company.id = public.order.id_company_client

        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Country: `
                select
                    *,
                    (
                        select count(company.id)
                        from company
                        where
                            company.id_country = country.id
                    ) as "company_count"
                from country
            `,
            Company: `
                select
                    *,
                    company.id + 1 as id_plus
                from company

                left join ./Country on
                    Country.id = company.id_country
            `,
            Order: `
                select
                    *,
                    'hello company, public.order, country' as "hello"
                from public.order

                left join ./Company on
                    Company.id = public.order.id_company_client
            `,
            OrderSale: `
                select *,
                    order_sale.sale_sum * 10000 as sale_sum
                from order_sale

                left join ./Order as Orders on
                    Orders.id = order_sale.id_order
            `
        },
        node: "OrderSale",
        request: {
            columns: [
                "sale_sum",
                "Orders.id",
                "Orders.hello",
                "Orders.Company.id_plus",
                "Orders.Company.Country.company_count"
            ]
        },
        result: `
            select
                order_sale.sale_sum * 10000 as "sale_sum",
                Orders.id as "Orders.id",
                'hello company, public.order, country' as "Orders.hello",
                "Orders.Company".id + 1 as "Orders.Company.id_plus",
                (
                    select count(company.id)
                    from company
                    where
                        company.id_country = "Orders.Company.Country".id
                ) as "Orders.Company.Country.company_count"
            from order_sale

            left join public.order as Orders
                left join company as "Orders.Company"
                    left join country as "Orders.Company.Country"

                    on "Orders.Company.Country".id = "Orders.Company".id_country
                on "Orders.Company".id = Orders.id_company_client
            on Orders.id = order_sale.id_order

        `
    });
});
