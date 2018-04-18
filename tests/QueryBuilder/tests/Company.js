"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const testRequest = require("../helpers/testRequest");

module.exports = function(getServers) {

    QUnit.test("Company", (assert) => {
        let SERVER_1 = getServers().server1;

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {},

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                columns: []
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                columns: ["id1"]
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                offset: -100
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                limit: -100
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                limit: NaN
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                offset: NaN
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
            reqeustNode: "ManyFrom1",
            request: {
                // двухсмысленная ссылка, нужно явно указать источник столбца
                columns: ["id"]
            },

            error: true
        });

        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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

    });

};
