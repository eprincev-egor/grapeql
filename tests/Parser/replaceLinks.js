"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testReplaceLinks(assert, test) {
    let coach;

    coach = new GrapeQLCoach(test.expression);
    coach.skipSpace();
    let expression = coach.parseExpression();

    expression.replaceLink(test.replace, test.to);

    coach = new GrapeQLCoach(test.result);
    coach.skipSpace();
    let expectedExpression = coach.parseExpression();

    let isEqual = !!weakDeepEqual(expression, expectedExpression);
    if ( !isEqual ) {
        console.log("break here");
    }

    assert.pushResult({
        result: isEqual,
        actual: expression.toString(),
        expected: expectedExpression.toString(),
        message: test.expression + "  =>  " + test.result
    });
}

module.exports = function(QUnit) {
    QUnit.test("Expression.replaceLinks", function(assert) {

        testReplaceLinks(assert, {
            expression: "company.id = 1",
            replace: "company",
            to: "country",
            result: "country.id = 1"
        });

        testReplaceLinks(assert, {
            expression: "cOmpany.id = 1",
            replace: "company",
            to: "country",
            result: "country.id = 1"
        });

        testReplaceLinks(assert, {
            expression: "cOmpany.Id = 1",
            replace: "companY.id",
            to: "country.coDe",
            result: "country.coDe = 1"
        });

        testReplaceLinks(assert, {
            expression: "\"company\".id = 1",
            replace: "company",
            to: "country",
            result: "\"company\".id = 1"
        });

        testReplaceLinks(assert, {
            expression: "\"company\".id = 1",
            replace: "\"company\"",
            to: "country",
            result: "country.id = 1"
        });

        testReplaceLinks(assert, {
            expression: "\"company\".id = 1",
            replace: "\"company\"",
            to: "\"country\"",
            result: "\"country\".id = 1"
        });

        testReplaceLinks(assert, {
            expression: "(company.id = 1) or (company.id = 2)",
            replace: "company",
            to: "country",
            result: "(country.id = 1) or (country.id = 2)"
        });

        testReplaceLinks(assert, {
            expression: "cast( company.id as bigint )",
            replace: "company",
            to: "country",
            result: "cast( country.id as bigint )"
        });

        testReplaceLinks(assert, {
            expression: "in( company.id, country.id, company.id )",
            replace: "company",
            to: "country",
            result: "in( country.id, country.id, country.id )"
        });

        testReplaceLinks(assert, {
            expression: "coalesce( company.id, country.id, company.id )",
            replace: "company",
            to: "country",
            result: "coalesce( country.id, country.id, country.id )"
        });

        testReplaceLinks(assert, {
            expression: "greater( company.id, country.id, company.id )",
            replace: "company",
            to: "country",
            result: "greater( country.id, country.id, country.id )"
        });

        testReplaceLinks(assert, {
            expression: "$$Company.id$$ + 1",
            replace: "company",
            to: "country",
            result: "$$Company.id$$ + 1"
        });

        testReplaceLinks(assert, {
            expression: "$$Company.id$$::text + 1",
            replace: "company",
            to: "country",
            result: "$$Company.id$$::text + 1"
        });

        testReplaceLinks(assert, {
            expression: "company.id between company.id - 1 and company.id + 1",
            replace: "company",
            to: "country",
            result: "country.id between country.id - 1 and country.id + 1"
        });

        testReplaceLinks(assert, {
            expression: "case when company.id > 10 then company.id - 1 else coalesce(company.id, 1) end",
            replace: "company",
            to: "country",
            result: "case when country.id > 10 then country.id - 1 else coalesce(country.id, 1) end"
        });

        testReplaceLinks(assert, {
            expression: "(select company.id) + 1",
            replace: "company",
            to: "country",
            result: "(select country.id) + 1"
        });

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
            expression: "(select true from (select) as some_1 order by company.id) + 1",
            replace: "company",
            to: "country",
            result: "(select true from (select) as some_1 order by country.id) + 1"
        });

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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

        testReplaceLinks(assert, {
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
    });
};
