"use strict";

describe("RemoveWiths", () => {
    const {testRemoveUnnecessary} = require("../../utils/init")(__dirname);

    testRemoveUnnecessary(`
        with
            x1 as (
                select 1
            )
        select *
        from x1
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                select 1
            )
        select *
        from company
    `, `
        select *
        from company
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                select 1
            ),
            x2 as (
                select *
                from x1
            )
        select *
        from company
    `, `
        select *
        from company
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                select 1
            ),
            x2 as (
                select *
                from x1
            )
        select *
        from company
        left join x2 on true
    `);

    testRemoveUnnecessary(`
        with recursive
        	x as (select 1),
        	y as (select 2)
        select ( select count(*) from x )
    `, `
        with recursive
            x as (select 1)
        select ( select count(*) from x )
    `);

    testRemoveUnnecessary(`
        with recursive
        	x as (select 1),
        	y as (select 2)
        select *
        from company
        order by (select * from y ) desc
    `, `
        with recursive
            y as (select 2)
        select *
        from company
        order by (select * from y ) desc
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        group by (select id from x)
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        group by cube (company.id, ((select id from x), 1))
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        group by rollup (company.id, ((select id from x), 1))
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        group by GROUPING SETS (company.id, (select id from x))
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        left join lateral (
            select *
            from x
        ) as y on true
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from company
        left join (
            select *
            from x
        ) as y on true
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from (
            select *
            from x
        ) as y
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from test_func(
            (select *
            from x)
        ) as y
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select from (
            select *
            from test_func(
                (select *
                from x)
            ) as y
        ) as a
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select test_func(
            (select *
            from x)
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select string_agg(
            company.name
            order by (select id from x)
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select string_agg(
            company.name
        ) within group (
            order by company.id desc, (select id from x)
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select string_agg(
            company.name
        ) filter (
            where
                company.id > (select id from x)
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select row_number() over (
            order by (select id from x) desc
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select row_number() over (
            partition by (select id from x)
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select cast( (select id from x) as bigint )
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select 1 in ((select id from x), (select id + 1 from x))
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select 1 in (select id from x)
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select 1 between 1 and (select id + 100 from x)
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select 1 between (select id from x) and 500
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select case
            when (select id from x)
            then 1
        end
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select case
            when true
            then (select id from x)
        end
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select case
            when true
            then 1
            else (select id from x)
        end
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select row_number() over (
            order by (select id from x) desc
        )
        from company
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select row_number() over (test_2)
        from company
        window
            test_1 as (partition by company.inn),
            test_2 as (partition by (select id from x))
    `);

    testRemoveUnnecessary(`
        with x as (select 1 as id)
        select row_number() over (test_2)
        from company
        window
            test_1 as (partition by company.inn),
            test_2 as (order by (select id from x) asc)
    `);

    testRemoveUnnecessary(`
        with x as (select 1)
        select * from (
            with x as (select 2)
            select * from x
        ) as test
    `, `
        select * from (
            with x as (select 2)
            select * from x
        ) as test
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    (5, 6)
            )
        select *
        from x1
    `, `
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x1
    `, `
        with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x3
    `, `
        with
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x3
    `);

    testRemoveUnnecessary(`
        with
            x1 as (
                values
                    (1, 2)
            ),
            x2 as (
                values
                    (3, 4)
            ),
            x3 as (
                values
                    ((select * from x2), 6)
            )
        select *
        from x2
    `, `
        with
            x2 as (
                values
                    (3, 4)
            )
        select *
        from x2
    `);

});
