"use strict";

describe("ParseDeps", () => {
    const {testGetDbColumn} = require("../utils/init")(__dirname);

    testGetDbColumn({
        node: "select * from company",
        link: "company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company",
        link: "company.\"id\"",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from \"company\"",
        link: "company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company, country",
        link: "country.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.country.columns.id})
    });

    testGetDbColumn({
        node: "select * from company as \"comp\"",
        link: "comp.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company as \"comp\"",
        link: "\"comp\".id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from public.company",
        link: "company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from public.company",
        link: "public.company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company",
        link: "public.company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company, test.company",
        link: "public.company.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from company, test.company",
        link: "test.company.id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from public.company",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    // column reference id is ambiguous
    testGetDbColumn({
        node: "select * from public.company, test.company",
        link: "id",
        error: true
    });

    // column id1 does not exist
    testGetDbColumn({
        node: "select * from public.company, test.company",
        link: "id1",
        error: true
    });

    // table name company specified more than once
    testGetDbColumn({
        node: "select * from company, company",
        link: "company.id",
        error: true
    });

    // invalid reference public.company.id to FROM-clause entry for table company
    testGetDbColumn({
        node: "select * from test.company as company",
        link: "public.company.id",
        error: true
    });

    testGetDbColumn({
        node: "select * from (select * from public.company) as comp",
        link: "comp.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from (select * from public.company) as comp",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from (select * from (select * from public.company) as comp2) as comp1",
        link: "comp1.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select * from test.company left join (select * from (select * from public.company) as comp2) as comp1 on true",
        link: "comp1.id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select *, company.id as id_clone from public.company",
        link: "id_clone",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select *, company.id + 1 as id1 from public.company",
        link: "id1",
        source: {expression: {elements: [
            {link: [
                {word: "company"},
                {word: "id"}
            ]},
            {operator: "+"},
            {number: "1"}
        ]}}
    });

    testGetDbColumn({
        node: "select * from (select 1 as id) as user_admin",
        link: "user_admin.id",
        source: {expression: {elements: [
            {number: "1"}
        ]}}
    });

    testGetDbColumn({
        node: `select *
        from
            (select 1 as id) as user_admin,
            (select 2 as id) as user_admin2`,
        link: "user_admin.id",
        source: {expression: {elements: [
            {number: "1"}
        ]}}
    });

    testGetDbColumn({
        node: `select *
        from
            (select 1 as id) as user_admin,
            (select 2 as id) as user_admin2`,
        link: "user_admin2.id",
        source: {expression: {elements: [
            {number: "2"}
        ]}}
    });

    testGetDbColumn({
        node: `with company as (
            select *
            from test.company
        )
            select *
            from company
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with company as (
            select *
            from company
        )
            select *
            from company
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with

            company1 as (
                select *
                from test.company
            ),

            company2 as (
                select *
                from company1
            )

            select *
            from company2
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with

            company1 as (
                select *
                from test.company
            ),

            company2 as (
                with
                    sub_company1 as (
                        select *
                        from company1
                    ),
                    sub_company2 as (
                        select *
                        from sub_company1
                    )

                select *
                from sub_company2
            )

            select *
            from company2
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `select
                lastOrder.*
            from company

            left join lateral (
                select
                    company.id as company_id
                from public.order

                limit 1
            ) as lastOrder on true
        `,
        link: "company_id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with
            company as (
                select *
                from test.company
            )

            select
                lastOrder.*
            from company

            left join lateral (
                select
                    company.id as company_id
                from public.order

                limit 1
            ) as lastOrder on true
        `,
        link: "company_id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with
            company as (
                select *
                from test.company
            )

            select
                lastOrder.*
            from company

            left join (
                select
                    company.id as company_id
                from public.order

                limit 1
            ) as lastOrder on true
        `,
        link: "company_id",
        error: true
    });

    testGetDbColumn({
        node: "select id as id from company",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select id as id from test.company",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select id as id from test.Company",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select id as id from Test.Company",
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: "select id as id from Test.Company",
        link: "Id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `select
                some_join1."id"
            from public.order

            left join lateral (
                select
                    public.order."id" as "id"
            ) as some_join1 on true
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.order.columns.id})
    });

    testGetDbColumn({
        node: `with
            public as (select * from test.company)
            select public.company.id
            from public, company
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.public.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with
            public as (select * from test.company)
            select public.id
            from public, company
        `,
        link: "id",
        source: (server) => ({dbColumn: server.database.schemas.test.tables.company.columns.id})
    });

    testGetDbColumn({
        node: `with
            test (id) as (
                values (1)
            )
        select *
        from test
        `,
        link: "id",
        source: () => ({
            expression: {elements: [
                {number: "1"}
            ]}
        })
    });

    testGetDbColumn({
        node: `with
            test (id) as (
                values (2)
            )
        select *
        from test
        `,
        link: "id",
        source: () => ({
            expression: {elements: [
                {number: "2"}
            ]}
        })
    });

    testGetDbColumn({
        node: `select *
        from (
            with
                test (id) as (
                    values (3)
                )
            select *
            from test
        ) as xxx
        `,
        link: "id",
        source: () => ({
            expression: {elements: [
                {number: "3"}
            ]}
        })
    });
});
