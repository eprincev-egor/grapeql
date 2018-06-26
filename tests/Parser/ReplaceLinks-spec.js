"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");
const testReplaceLinks = require("../utils/testReplaceLinks");

describe("Expression.replaceLinks", () => {

    testReplaceLinks({
        expression: "company.id = 1",
        replace: "company",
        to: "country",
        result: "country.id = 1"
    });

    testReplaceLinks({
        expression: "cOmpany.id = 1",
        replace: "company",
        to: "country",
        result: "country.id = 1"
    });

    testReplaceLinks({
        expression: "cOmpany.Id = 1",
        replace: "companY.id",
        to: "country.coDe",
        result: "country.coDe = 1"
    });

    testReplaceLinks({
        expression: "\"company\".id = 1",
        replace: "company",
        to: "country",
        result: "country.id = 1"
    });

    testReplaceLinks({
        expression: "\"cOmpany\".id = 1",
        replace: "company",
        to: "country",
        result: "\"cOmpany\".id = 1"
    });

    testReplaceLinks({
        expression: "\"cOmpany\".id = 1",
        replace: "cOmpany",
        to: "country",
        result: "country.id = 1"
    });

    testReplaceLinks({
        expression: "\"company\".id = 1",
        replace: "\"company\"",
        to: "country",
        result: "country.id = 1"
    });

    testReplaceLinks({
        expression: "\"company\".id = 1",
        replace: "\"company\"",
        to: "\"country\"",
        result: "\"country\".id = 1"
    });

    testReplaceLinks({
        expression: "(company.id = 1) or (company.id = 2)",
        replace: "company",
        to: "country",
        result: "(country.id = 1) or (country.id = 2)"
    });

    testReplaceLinks({
        expression: "cast( company.id as bigint )",
        replace: "company",
        to: "country",
        result: "cast( country.id as bigint )"
    });

    testReplaceLinks({
        expression: "in( company.id, country.id, company.id )",
        replace: "company",
        to: "country",
        result: "in( country.id, country.id, country.id )"
    });

    testReplaceLinks({
        expression: "coalesce( company.id, country.id, company.id )",
        replace: "company",
        to: "country",
        result: "coalesce( country.id, country.id, country.id )"
    });

    testReplaceLinks({
        expression: "greater( company.id, country.id, company.id )",
        replace: "company",
        to: "country",
        result: "greater( country.id, country.id, country.id )"
    });

    testReplaceLinks({
        expression: "$$Company.id$$ + 1",
        replace: "company",
        to: "country",
        result: "$$Company.id$$ + 1"
    });

    testReplaceLinks({
        expression: "$$Company.id$$::text + 1",
        replace: "company",
        to: "country",
        result: "$$Company.id$$::text + 1"
    });

    testReplaceLinks({
        expression: "company.id between company.id - 1 and company.id + 1",
        replace: "company",
        to: "country",
        result: "country.id between country.id - 1 and country.id + 1"
    });

    testReplaceLinks({
        expression: "case when company.id > 10 then company.id - 1 else coalesce(company.id, 1) end",
        replace: "company",
        to: "country",
        result: "case when country.id > 10 then country.id - 1 else coalesce(country.id, 1) end"
    });

    testReplaceLinks({
        expression: "(select company.id) + 1",
        replace: "company",
        to: "country",
        result: "(select country.id) + 1"
    });

    testReplaceLinks({
        expression: `(
            select company.id
            from (select) as some_1
            where
                company.id > 10
            limit 1
        ) + 1`,
        replace: "company",
        to: "country",
        result: `(
            select country.id
            from (select) as some_1
            where
                country.id > 10
            limit 1
        ) + 1`
    });

    testReplaceLinks({
        expression: `(
            select 1
            from (select) as some_1
            having count(company.id) > 1
        ) + 1`,
        replace: "company",
        to: "country",
        result: `(
            select 1
            from (select) as some_1
            having count(country.id) > 1
        ) + 1`
    });

    testReplaceLinks({
        expression: "(select true from (select) as some_1 order by company.id) + 1",
        replace: "company",
        to: "country",
        result: "(select true from (select) as some_1 order by country.id) + 1"
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select 1) as some_1
                group by company.id
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select 1) as some_1
                group by country.id
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select 1) as some_1
                group by cube (company.id, (country.id, 1))
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select 1) as some_1
                group by cube (country.id, (country.id, 1))
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select 1) as some_1
                group by rollup (company.id, (country.id, 1))
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select 1) as some_1
                group by rollup (country.id, (country.id, 1))
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select 1) as some_1
                group by grouping SETS (company.id, country.code)
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select 1) as some_1
                group by grouping SETS (country.id, country.code)
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                with
                    x as (
                        select company.id
                    )
                select true
                from x
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                with
                    x as (
                        select country.id
                    )
                select true
                from x
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (
                    select company.id
                ) as some_1
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (
                    select country.id
                ) as some_1
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select) as some_1

                left join x on company.id = 1
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select) as some_1

                left join x on country.id = 1
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select true
                from (select) as some_1

                left join lateral (select company.id) as x on company.id = 1
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select true
                from (select) as some_1

                left join lateral (select country.id) as x on country.id = 1
            ) = 1
        `
    });

    testReplaceLinks({
        expression: `
            (
                select company.id
                from company
            ) = 1
        `,
        replace: "company",
        to: "country",
        result: `
            (
                select company.id
                from company
            ) = 1
        `
    });

    testReplaceLinks({
        expression: "a.b.c.d.e.f",
        replace: "a.b.c",
        to: "x.y.z",
        result: "x.y.z.d.e.f"
    });

    testReplaceLinks({
        expression: `(
            select
                string_agg( country.name order by country.code )
                filter (where country.code is not null )
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                string_agg( company.name order by company.code )
                filter (where company.code is not null )
        )`
    });

    testReplaceLinks({
        expression: `(
            select
                string_agg( country.name )
                within group (order by country.code)
                filter (where country.code is not null )
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                string_agg( company.name )
                within group (order by company.code)
                filter (where company.code is not null )
        )`
    });

    testReplaceLinks({
        expression: `(
            select
                row_number()
                over (partition by country.id, country.code)
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                row_number()
                over (partition by company.id, company.code)
        )`
    });

    testReplaceLinks({
        expression: `(
            select
                row_number()
                over (order by country.id desc, country.code desc)
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                row_number()
                over (order by company.id desc, company.code desc)
        )`
    });

    testReplaceLinks({
        expression: `(
            select
                row_number() over (test_x) as index_x
            from company

            window
                test_x as (partition by country.id, country.code)
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                row_number() over (test_x) as index_x
            from company

            window
                test_x as (partition by company.id, company.code)
        )`
    });

    testReplaceLinks({
        expression: `(
            select
                row_number() over (test_x) as index_x
            from company

            window
                test_x as (order by country.id desc, country.code desc)
        )`,
        replace: "country",
        to: "company",
        result: `(
            select
                row_number() over (test_x) as index_x
            from company

            window
                test_x as (order by company.id desc, company.code desc)
        )`
    });

    it("don't touch table in fromItems", () => {
        let sql = "select from country";

        let select = new GrapeQLCoach.Select(sql);
        let clone = new GrapeQLCoach.Select(sql);

        select.replaceLink("country", "company");


        let isEqual = !!weakDeepEqual(select, clone);

        if ( !isEqual ) {
            console.log("break here");
        }

        assert.ok(isEqual);
    });
});
