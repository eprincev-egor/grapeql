"use strict";

const {stopServer, startServer} = require("../../utils/serverHelpers");
const testRequest = require("../../utils/testRequest");

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

            left join company as company_client on 
                company_client.id = public.order.id_company_client 

            left join country as "company_client.country" on 
                "company_client.country".id = company_client.id_country 
        `
    });
    /*
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
            
            left join public.order as orders on
                orders.id = order_sale.id_order

            left join company as "orders.company_client" on 
                "orders.company_client".id = orders.id_company_client 

            left join country as "orders.company_client.country" on 
                "orders.company_client.country".id = "orders.company_client".id_country 
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
                country.code as "company_client.last_order.company_partner.country.code"
            from public.order

            left join company as company_client on
                company_client.id = public.order.id_company_client
            
            left join public.order as last_order on
                last_order.id = company_client.id_last_order
            
            left join company as company_partner on
                company_partner.id = last_order.id_company_partner
            
            left join country on
                country.id = company_partner.id_country
        `
    });
    
    */
   
});
