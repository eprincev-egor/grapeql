"use strict";

const testFindDeps = require("../utils/testFindDeps");

describe("FindDeps", () => {
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
            select *
            from companies
        `,
        result: {
            tables: [
                {
                    schema: "public",
                    name: "companies",
                    columns: "*"
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
                    columns: "*"
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
                    columns: "*"
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
                    columns: "*"
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
});
