"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const Query = require("../../src/server/Query");

const assert = require("assert");
const weakDeepEqual = require("../utils/weakDeepEqual");
const {stopServer, startServer} = require("../utils/serverHelpers");

let server;


function testRequest(requestTest) {
    it(JSON.stringify( requestTest.request, null, 4 ), () => {
        if ( requestTest.result ) {
            let query = new Query({
                server,
                node: server.nodes[ requestTest.reqeustNode ],
                request: requestTest.request
            });

            let resultSql = query.toString();
            let result = GrapeQLCoach.parseEntity( resultSql );
            let testResult = GrapeQLCoach.parseEntity( requestTest.result );

            let isEqual = !!weakDeepEqual(testResult, result);

            assert.ok(isEqual);
        } else if ( requestTest.error ) {
            try {
                new Query({
                    server,
                    node: server.nodes[ requestTest.reqeustNode ],
                    request: requestTest.request
                });

                assert.ok(false, "expected error");
            } catch(err) {
                assert.ok(true, "expected error");
            }
        }
    });
}

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("RemoveJoins", () => {
    testRequest({
        reqeustNode: "Company",
        request: {},

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            columns: []
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            columns: ["id1"]
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            offset: -100
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            limit: -100
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            limit: NaN
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            offset: NaN
        },

        error: true
    });

    testRequest({
        reqeustNode: "ManyFrom1",
        request: {
            // двухсмысленная ссылка, нужно явно указать источник столбца
            columns: ["id"]
        },

        error: true
    });

    testRequest({
        reqeustNode: "ManyFrom1",
        request: {
            // если в таблицу country добавить столбец inn,
            // то такой запрос станет выдавать ошибку,
            // поэтому отказываемся от сомнительных удобств
            // в пользу явности и стабильности системы
            columns: ["inn"]
        },

        error: true
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            columns: ["id", "inn", "name"],
            offset: 0,
            limit: 2
        },

        result: `
                select
                    company.id as "id",
                    public.company.inn as "inn",
                    coalesce( company.name, '(Не определено)' )  as "name"
                from company

                limit 2
            `
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            columns: ["id", "INN"],
            offset: 1
        },

        result: `
                select
                    company.id as "id",
                    public.company.inn as "INN"
                from company

                offset 1
            `
    });

    testRequest({
        reqeustNode: "Company",
        request: {
            columns: ["id"],
            offset: 1,
            where: ["id", "=", 1]
        },
        result: `
                select
                    company.id as "id"
                from company

                where
                    company.id = 1
                offset 1
            `
    });

    testRequest({
        reqeustNode: "Order",
        request: {
            columns: ["id"]
        },
        result: `
            select
                public.Order."id" as "id"
            from public.Order
        `
    });

    testRequest({
        reqeustNode: "Order",
        request: {
            columns: ["id", "CompanyClient.inn"]
        },
        result: `
            select
            public.Order."id" as "id",
            "CompanyClient".inn as "CompanyClient.inn"
            from public.Order

            left join company as "CompanyClient" on
                "CompanyClient".id = public.Order.id_company_client
        `
    });

    testRequest({
        reqeustNode: "Order",
        request: {
            columns: ["id"],
            where: ["CompanyClient.inn", "is", "not null"]
        },
        result: `
            select
                public.Order."id" as "id"
            from public.Order

            left join company as "CompanyClient" on
                "CompanyClient".id = public.Order.id_company_client

            where
                "CompanyClient".inn is not null
        `
    });

    testRequest({
        reqeustNode: "Order",
        request: {
            columns: ["id", "CompanyClient.country.code"]
        },
        result: `
            select
            public.Order."id" as "id",
            "CompanyClient.country".code as "CompanyClient.country.code"
            from public.Order

            left join company as "CompanyClient" on
                "CompanyClient".id = public.Order.id_company_client

            left join country as "CompanyClient.country" on
                "CompanyClient.country".id = "CompanyClient".id_country
        `
    });
});
