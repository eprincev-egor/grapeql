"use strict";

describe("Cache", () => {
    const {testRequest} = require("../../utils/init")(__dirname);

    testRequest({
        nodes: {
            Company: `
                select * from company
            `
        },
        cache: [
            `
            cache for company (
                select
                    count(*) as orders_count
                from orders
                where
                    orders.id_client = company.id
            )
            after change orders set where
                orders.id_client = company.id
            `
        ],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                company.id,
                gql_cache.company.orders_count
            from company

            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });

});
