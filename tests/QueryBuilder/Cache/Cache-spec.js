"use strict";

describe("Cache", () => {
    const {testRequest} = require("../../utils/init")(__dirname);
    const orders_count_cache = `
        cache for company (
            select
                count(*) as orders_count
            from orders
            where
                orders.id_client = company.id
        )
        after change orders set where
            orders.id_client = company.id
    `;
    
    testRequest({
        nodes: {
            Company: `
                select * from company
            `
        },
        cache: [orders_count_cache],
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

    testRequest({
        nodes: {
            Company: `
                select company.*
                from company
            `
        },
        cache: [orders_count_cache],
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

    testRequest({
        nodes: {
            Company: `
                select
                    company.id,
                    company.orders_count
                from company
            `
        },
        cache: [orders_count_cache],
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

    testRequest({
        nodes: {
            Company: `
                select
                    company.id as orders_count,
                    company.orders_count as id
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                gql_cache.company.orders_count as "id",
                company.id as "orders_count"
            from company

            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    cmp.id,
                    cmp.orders_count
                from company as cmp
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                cmp.id,
                gql_cache.company.orders_count
            from company as cmp

            left join gql_cache.company on
                gql_cache.company.id = cmp.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    id,
                    orders_count
                from company as cmp
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                id,
                orders_count
            from company as cmp

            left join gql_cache.company on
                gql_cache.company.id = cmp.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    id,
                    orders_count
                from company as cmp
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                id,
                orders_count
            from company as cmp

            left join gql_cache.company on
                gql_cache.company.id = cmp.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    ID,
                    ORDERS_COUNT
                from company as cmp
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                ID as "id",
                ORDERS_COUNT as "orders_count"
            from company as cmp

            left join gql_cache.company on
                gql_cache.company.id = cmp.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    "id",
                    "orders_count"
                from company as cmp
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                "id",
                "orders_count"
            from company as cmp

            left join gql_cache.company on
                gql_cache.company.id = cmp.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    cOmpaNy.Id,
                    CoMpaNy.orders_Count
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                cOmpaNy.Id as "id",
                gql_cache.company.orders_count as "orders_count"
            from company

            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });
/*
    testRequest({
        nodes: {
            Company: `
                select
                    public.company.id,
                    public.company.orders_count
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "orders_count"]
        },
        result: `
            select 
                public.company.id,
                gql_cache.company.orders_count
            from company

            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });
*/
});
