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
                gql_cache.company.orders_count as "orders_count"
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

    testRequest({
        nodes: {
            Company: `
                select
                    company.id,
                    company.orders_count
                from public.company
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
            from public.company

            left join gql_cache.company on
                gql_cache.company.id = public.company.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    public.company.id,
                    public.company.orders_count
                from public.company
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
            from public.company

            left join gql_cache.company on
                gql_cache.company.id = public.company.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    orders_count + 1 as test
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["test"]
        },
        result: `
            select 
                gql_cache.company.orders_count + 1 as "test"
            from company

            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    'orders_count' as test
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["test"]
        },
        result: `
            select 
                'orders_count' as "test"
            from company
        `
    });

    testRequest({
        nodes: {
            Company: `
                select *
                from company
                where
                    company.orders_count > 100
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            select 
                company.id
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            where
                gql_cache.company.orders_count > 100
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    *,
                    coalesce( company.orders_count, 0 ) as orders_count
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
                coalesce( gql_cache.company.orders_count, 0 ) as "orders_count"
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    *,
                    coalesce( company.orders_count, 0 ) as orders_count
                from company
            `
        },
        cache: [orders_count_cache],
        node: "Company",
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
        nodes: {
            Company: `
                select *
                from company
                order by company.orders_count desc
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            select 
                company.id
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            order by gql_cache.company.orders_count desc
        `
    });

    testRequest({
        nodes: {
            Company: `
                select *
                from company
                order by orders_count desc
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            select 
                company.id
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            order by gql_cache.company.orders_count desc
        `
    });

    testRequest({
        nodes: {
            Company: `
                select *
                from company
                order by orders_count, orders_count + 1 desc
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            select 
                company.id
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            order by 
                gql_cache.company.orders_count,
                gql_cache.company.orders_count + 1 desc
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    sum( orders_count ) as orders_count
                from company
                group by manager_name
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["orders_count"]
        },
        result: `
            select 
                sum( gql_cache.company.orders_count ) as "orders_count"
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            group by manager_name
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    string_agg( distinct manager_name, ', ' ) as test
                from company
                group by orders_count
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["test"]
        },
        result: `
            select 
                string_agg( distinct manager_name, ', ' ) as "test"
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            group by gql_cache.company.orders_count
        `
    });

    testRequest({
        nodes: {
            Company: `
                select
                    string_agg( distinct manager_name, ', ' ) as test
                from company

                group by 
                    grouping sets (
                        (),
                        rollup (
                            company.orders_count
                        )
                    )
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["test"]
        },
        result: `
            select 
                string_agg( distinct manager_name, ', ' ) as "test"
            from company
            
            left join gql_cache.company on
                gql_cache.company.id = company.id

            group by 
                grouping sets (
                    (),
                    rollup (
                        gql_cache.company.orders_count
                    )
                )
        `
    });

    testRequest({
        nodes: {
            Company: `
                with 
                    x as (
                        select
                            id,
                            orders_count as x
                        from company
                    )
                select * 
                from x
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id", "x"]
        },
        result: `
            with 
                x as (
                    select
                        id,
                        gql_cache.company.orders_count as x
                    from company

                    left join gql_cache.company on
                        gql_cache.company.id = company.id
                )
            select
                x.id,
                x.x
            from x
        `
    });
/*
    testRequest({
        nodes: {
            Company: `
                with 
                    x as (
                        select
                            id,
                            orders_count as x
                        from company
                    )
                select * 
                from x
            `
        },
        cache: [orders_count_cache],
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            with 
                x as (
                    select
                        id
                    from company
                )
            select
                x.id
            from x
        `
    });
*/
});
