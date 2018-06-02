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

describe("HardJoinFile", () => {
    testRequest({
        server: () => server,
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select * from company

                left join ./Country as country on
                    country.id = company.id_country
            `,
            Order: `
                select *
                from public.order

                left join ./Company as company_client on
                    company_client.id = public.order.id_company_client
            `
        },
        node: "Order",
        request: {
            columns: ["company_client.country.code"]
        },
        result: `
            select
                "company_client.country".code as "company_client.country.code"
            from public.order

            left join company as company_client
                left join country as "company_client.country"
                on "company_client.country".id = company_client.id_country
            on company_client.id = public.order.id_company_client
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Country: `
                select * from country
            `,
            Company: `
                select * from company

                left join ./Country as country on
                    country.id = company.id_country
            `,
            Order: `
                select *
                from public.order

                left join ./Company as company_client on
                    company_client.id = public.order.id_company_client
            `,
            OrderSale: `
                select *
                from order_sale

                left join ./Order as orders on
                    orders.id = order_sale.id_order
            `
        },
        node: "OrderSale",
        request: {
            columns: ["orders.company_client.country.code"]
        },
        result: `
            select
                "orders.company_client.country".code as "orders.company_client.country.code"
            from order_sale

            left join public.order as orders
                left join company as "orders.company_client"
                    left join country as "orders.company_client.country"
                    on "orders.company_client.country".id = "orders.company_client".id_country
                on "orders.company_client".id = orders.id_company_client
            on orders.id = order_sale.id_order
        `
    });


    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join ./Country on
                    Country.id = company.id_country

                left join ./Order as last_order on
                    last_order.id = company.id_last_order
            `,
            Country: `
                select * from country
            `,
            Order: `
                select *
                from public.order

                left join ./Company as company_client on
                    company_client.id = public.order.id_company_client

                left join ./Company as company_partner on
                    company_partner.id = public.order.id_company_partner

                left join ./Country as country_start on
                    country_start.id = public.order.id_country_start

                left join ./Country as country_end on
                    country_end.id = public.order.id_country_end
            `
        },
        node: "Order",
        request: {
            columns: ["company_client.last_order.company_partner.country.code"]
        },
        result: `
            select
                "company_client.last_order.company_partner.Country".code as "company_client.last_order.company_partner.country.code"
            from public.order

            left join company as company_client
                left join public.order as "company_client.last_order"
                    left join company as "company_client.last_order.company_partner"
                        left join country as "company_client.last_order.company_partner.Country"
                        on "company_client.last_order.company_partner.Country".id = "company_client.last_order.company_partner".id_country
                    on "company_client.last_order.company_partner".id = "company_client.last_order".id_company_partner
                on "company_client.last_order".id = company_client.id_last_order
            on company_client.id = public.order.id_company_client
        `
    });


    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join lateral (
                    select count(public.order.id) as quantity
                    from public.order
                    where
                        public.order.id_company_client = company.id
                ) as order_totals on true
            `,
            Order: `
                select *
                from public.order

                left join ./Company as company_client on
                    company_client.id = public.order.id_company_client
            `
        },
        node: "Order",
        request: {
            columns: ["company_client.order_totals.quantity"]
        },
        result: `
            select
                "company_client.order_totals".quantity as "company_client.order_totals.quantity"
            from public.order

            left join company as company_client
                left join lateral (
                    select count(public.order.id) as quantity
                    from public.order
                    where
                        public.order.id_company_client = company_client.id
                ) as "company_client.order_totals" on true
            on company_client.id = public.order.id_company_client
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Company: `
                select * from company

                left join lateral (
                    select count(public.order.id) as quantity
                    from public.order
                    where
                        public.order.id_company_client = company.id
                ) as order_totals on true
            `,
            Order: `
                select *
                from public.order

                left join ./Company as company_client on
                    company_client.id = public.order.id_company_client
            `,
            OrderSale: `
                select *
                from order_sale

                left join ./Order as orders on
                    orders.id = order_sale.id_order
            `
        },
        node: "OrderSale",
        request: {
            columns: ["orders.company_client.order_totals.quantity"]
        },
        result: `
            select
                "orders.company_client.order_totals".quantity as "orders.company_client.order_totals.quantity"
            from order_sale

            left join public.order as orders
                left join company as "orders.company_client"
                    left join lateral (
                        select count(public.order.id) as quantity
                        from public.order
                        where
                            public.order.id_company_client = "orders.company_client".id
                    ) as "orders.company_client.order_totals" on true
                on "orders.company_client".id = orders.id_company_client
            on orders.id = order_sale.id_order
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Order: `
                select *
                from public.order

                left join company as company_client on
                    company_client.id = public.order.id_company_client

                left join country on
                    country.id = company_client.id_country
            `,
            OrderSale: `
                select *
                from order_sale

                left join ./Order as orders on
                    orders.id = order_sale.id_order
            `
        },
        node: "OrderSale",
        request: {
            columns: ["orders.country.code"]
        },
        result: `
            select
                "orders.country".code as "orders.country.code"
            from order_sale

            left join public.order as orders
                left join company as "orders.company_client" on
                    "orders.company_client".id = orders.id_company_client

                left join country as "orders.country" on
                    "orders.country".id = "orders.company_client".id_country
            on orders.id = order_sale.id_order
        `
    });

    testRequest({
        server: () => server,
        nodes: {
            Order: `
                select *
                from public.order

                left join company as company_client on
                    company_client.id = public.order.id_company_client

                left join lateral (
                    select count(public.order.id) as quantity
                    from public.order
                    where
                        public.order.id_company_client = company_client.id
                ) as client_totals on true
            `,
            OrderSale: `
                select *
                from order_sale

                left join ./Order as orders on
                    orders.id = order_sale.id_order
            `
        },
        node: "OrderSale",
        request: {
            columns: ["orders.client_totals.quantity"]
        },
        result: `
            select
                "orders.client_totals".quantity as "orders.client_totals.quantity"
            from order_sale

            left join public.order as orders
                left join company as "orders.company_client" on
                    "orders.company_client".id = orders.id_company_client

                left join lateral (
                    select count(public.order.id) as quantity
                    from public.order
                    where
                        public.order.id_company_client = "orders.company_client".id
                ) as "orders.client_totals" on true
            on orders.id = order_sale.id_order
        `
    });
});
