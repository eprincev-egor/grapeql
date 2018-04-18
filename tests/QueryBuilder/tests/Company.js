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
