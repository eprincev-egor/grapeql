"use strict";

describe("Vars", () => {

    const {
        testRequest,
        testRequestCount,
        testRequestIndexOf
    } = require("../../utils/init")(__dirname);
    
    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: 1
            }
        },
        result: `
            select
                company.id
            from company

            where
                id = 1
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                company_id: 1
            }
        },
        result: `
            select
                company.id
            from company

            where
                id = 1
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                company_id: 1,
                $company_id: 2
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: null
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                company_id: null
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: undefined
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint not null;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                company_id: undefined
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: "undefined"
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                company_id: "undefined"
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $company_id bigint;
                select * from company
                where id = $company_id
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $company_id: undefined
            }
        },
        result: `
            select
                company.id
            from company

            where
                id = null
        `
    });

    testRequestCount({
        nodes: {
            Company: `
                declare $inn text;
                select * from company
                where inn = $inn
            `
        },
        node: "Company",
        request: {
            vars: {
                $inn: "1234"
            }
        },
        result: `
            select
                count(*) as count
            from company
            where inn = $tag1$1234$tag1$
        `
    });

    testRequestIndexOf({
        nodes: {
            Company: `
                declare $id_country integer;
                select * from company
                where
                    id_country = $id_country
            `
        },
        node: "Company",
        request: {
            row: ["id", "=", 150],
            vars: {
                $id_country: 1
            }
        },
        result: `
            select
                query.grapeql_row_index as index
            from (
                select
                    company.id,
                    row_number() over() as grapeql_row_index
                from company

                where
                    id_country = 1
            ) as query
            where
                query."id" = 150
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            with vars as (
                select
                    false as some_bool
            )

            select
                company.id
            from company

            where
                (select vars.some_bool from vars)
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $some_bool boolean default false;

                with vars as (
                    select
                        'lol' as some_bool
                )
                select * from company

                left join vars on true

                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id", "vars.some_bool"]
        },
        result: `
            with
                vars as (
                    select
                        'lol' as some_bool
                ),
                vars1 as (
                    select
                        false as some_bool
                )

            select
                company.id,
                vars.some_bool as "vars.some_bool"
            from company

            left join vars on true

            where
                (select vars1.some_bool from vars1)
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
                where $some_bool
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $some_bool: true
            }
        },
        result: `
            select
                company.id
            from company

            where
                true
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $some_bool boolean default false;
                select * from company
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $some_bool: "some"
            }
        },
        error: Error
    });

    testRequest({
        nodes: {
            Company: `
                declare $price numeric check( $price > 0 );
                select * from company
                where
                    company.id > $price
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $price: 100
            }
        },
        result: `
            with vars as (
                select
                    case
                        when 100 > 0
                        then  100
                        else raise_exception($tag1$variable price violates check constraint$tag1$)
                    end as price
            )

            select
                company.id
            from company

            where
                company.id > (select vars.price from vars)
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $from text default 'ru';
                select * from company

                inner join country on
                    country.id = company.id_country and
                    country.code = $from
            `
        },
        node: "Company",
        request: {
            columns: ["id", "country.id"],
            vars: {
                from: undefined
            }
        },
        result: `
            with vars as (
                select
                    'ru' as from
            )

            select
                company.id,
                country.id as "country.id"
            from company

            inner join country on
                country.id = company.id_country and
                country.code = (select vars.from from vars)
        `
    });


    testRequest({
        nodes: {
            Company: `
                declare $some numeric check( $some <> 0 ) default 0;
                select * from company
                where
                    company.id > $some
            `
        },
        node: "Company",
        request: {
            columns: ["id"]
        },
        result: `
            with vars as (
                select
                    case
                        when 0 <> 0
                        then  0
                        else raise_exception($tag1$variable some violates check constraint$tag1$)
                    end as some
            )

            select
                company.id
            from company

            where
                company.id > (select vars.some from vars)
        `
    });

    testRequest({
        nodes: {
            Company: `
                declare $some numeric check( $some <> 0 ) default 0;
                select * from company
                where
                    company.id > $some
            `
        },
        node: "Company",
        request: {
            columns: ["id"],
            vars: {
                $some: "1"
            }
        },
        result: `
            with vars as (
                select
                    case
                        when 1 <> 0
                        then  1
                        else raise_exception($tag1$variable some violates check constraint$tag1$)
                    end as some
            )

            select
                company.id
            from company

            where
                company.id > (select vars.some from vars)
        `
    });

});
