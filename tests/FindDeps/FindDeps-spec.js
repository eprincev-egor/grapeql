"use strict";

const {testFindDeps} = require("../utils/init")(__dirname);

describe("FindDeps", () => {

    testFindDeps({
        query: `
            select companies.id
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    
    testFindDeps({
        query: `
            select *
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select companies.*
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select cmp.*
            from companies as cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select id
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select ID
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select "id"
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    

    testFindDeps({
        query: `
            select cOmpanies.iD
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });
    testFindDeps({
        query: `
            select id
            from companies as cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });
                  

    testFindDeps({
        query: `
            select cmp.id
            from companies as cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select cMp.iD
            from companies as Cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select public.companies.id
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select companies.id
            from public.companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select public.companies.id
            from public.companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select public.companies
            from public.companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select companies
            from public.companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select public.companies
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 
                public.companies.id,
                companies.name
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 
                id + companies.inn::integer as "some1",
                companies.name || 'some' as "some2"
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });


    testFindDeps({
        query: `
            select 'companies.inn'
            from companies
            where
                id > 100
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select *
            from companies
            where
                id > 100
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select cmp.name
            from companies as cmp
            where
                id > 100 and
                cmp.inn is not null
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select coalesce( cmp.name, '' )
            from companies as cmp
            where
                id > 100 and
                cmp.inn is not null and
                coalesce( cmp.name, '' ) <> ''
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select id
            from companies
            order by name
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select id
            from companies as cmp
            order by name, cmp.inn
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select array_agg( id )
            from companies as cmp
            group by name
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select array_agg( id )
            from companies as cmp
            group by
                grouping sets (
                    (),
                    rollup (
                        cmp.inn
                    )
                )
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 1
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: []
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select count( * )
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: []
                }
            ]
        }
    });
    


    testFindDeps({
        query: `
            with
                x as (
                    select 
                        id as col
                    from companies
                )
            select col
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });


    testFindDeps({
        query: `
            with
                x as (
                    select 
                        1 as id,
                        name
                    from companies
                )
            select 
                id,
                name
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select 
                        1 as id,
                        inn
                    from companies
                )
            select *
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select *
                    from companies
                )
            select *
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select *
                    from companies
                )
            select
                x.id::text || x.name
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select inn
                    from companies
                    where
                        id > 100
                )
            select inn
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select inn as nice
                    from companies
                    where
                        id > 100
                )
            select nice
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select 1 as id
                    from companies
                    where
                        id > 100
                )
            select *
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select inn as id
                    from companies
                    where
                        id > 100
                )
            select *
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    select
                        id, inn
                    from companies
                    where
                        name is not null
                )
            select inn
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    with
                        y as (
                            select inn as id
                            from companies
                        )
                    select *
                    from y
                )
            select id
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                x as (
                    with
                        y as (
                            select inn as test
                            from companies
                        )
                    select test as id
                    from y
                )
            select id
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                y as (
                    select inn as test
                    from companies
                ),
                x as (
                    select test as id
                    from y
                )
            select id
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "inn"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with
                y as (
                    select inn as test
                    from companies
                ),
                x as (
                    with
                        y as (
                            select name as test
                            from companies
                        )
                    select test as id
                    from y
                )
            select id
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "name"
                    ]
                }
            ]
        }
    });

    

    testFindDeps({
        query: `
            select 1
            from companies
            right join countries on true
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: []
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: []
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 1
            from companies

            right join countries on
                countries.id = companies.id_country
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id_country"
                    ]
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select
                code,
                countries.name,
                companies.name
            from public.companies
            
            left join countries on
                countries.id = companies.id_country
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id_country",
                        "name"
                    ]
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: [
                        "code",
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x as (
                    select 1 as id
                    from companies
                )
            select x.*
            from x
            right join countries on true
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: []
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: []
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x as (
                    values
                        (1, 'Red'),
                        (2, 'Green')
                )
            select x.*
            from x
        `,
        result: {
            tables: [
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x (id, name) as (
                    values
                        (1, 'Red'),
                        (2, 'Green')
                )
            select id, name
            from x
        `,
        result: {
            tables: []
        }
    });

    testFindDeps({
        query: `
            with 
                x (id, name) as (
                    values
                        (1, 'Red'),
                        (2, 'Green')
                ),
                y (test) as (
                    select
                        id::text || ' ' || name::text as test
                    from x
                )
            select test
            from y
        `,
        result: {
            tables: []
        }
    });

    testFindDeps({
        query: `
            with 
                x (id, name) as (
                    values
                        (1, 'Red'),
                        (2, 'Green')
                ),
                y as (
                    select
                        *,
                        id::text || ' ' || name::text as test
                    from x
                )
            select id, name, test
            from y
        `,
        result: {
            tables: []
        }
    });

    testFindDeps({
        query: `
            with 
                x (id, name) as (
                    select *
                    from companies
                ),
                y as (
                    select
                        id::text as test
                    from x
                )
            select test
            from y
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x (id, name) as (
                    select *
                    from companies
                ),
                y as (
                    select
                        id::text as test
                    from x
                )
            select *
            from y
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select row_to_json( companies )
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });


    testFindDeps({
        query: `
            with 
                x as (
                    select *
                    from companies
                )
            
            select row_to_json( x ) as data
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x as (
                    select *
                    from companies
                ),
                y as (
                    select
                        *,
                        id::text || ' ' || name::text as test
                    from x
                )
            select id, name, test
            from y
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x (test) as (
                    select id
                    from companies
                )
            select test
            from x
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            with 
                x (_id, _name) as (
                    select *
                    from companies
                ),
                y as (
                    select row_to_json( x ) as data
                    from x
                )
            select '[' || string_agg( data::text, ',' ) || ']'
            from y
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select cmp.*
            from (
                select *
                from companies
            ) as cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id",
                        "id_country",
                        "inn",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 
                id_1
            from 
                (
                    select *
                    from countries
                ) as x1,
                (
                    select id + 1 as id_1
                    from companies
                ) as x2
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: []
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select 
                id_1
            from 
                (
                    select *
                    from countries
                    where
                        countries is not null
                ) as x1,
                (
                    select id + 1 as id_1
                    from companies
                ) as x2
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                },
                {
                    schema: "public",
                    name: "countries",
                    columns: [
                        "code",
                        "id",
                        "name"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select bomb
            from (
                with 
                    x ("bomb") as (
                        select *
                        from (
                            select *
                            from companies
                        ) as u
                    )
                select *
                from x
            ) as cmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });

    testFindDeps({
        query: `
            select id
            from unnest( array[1, 2]::integer[] ) as id
        `,
        result: {
            tables: []
        }
    });

    testFindDeps({
        query: `
            select *
            from (
                select _id
                from 
                    unnest( array[1, 2]::integer[] ) as _id
                
                right join companies on
                    companies.id = _id
            ) as tmp
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: [
                        "id"
                    ]
                }
            ]
        }
    });
});
