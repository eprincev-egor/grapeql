"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const testRequest = require("../helpers/testRequest");

module.exports = function(getServers) {

    QUnit.test("Order", (assert) => {
        let SERVER_1 = getServers().server1;


        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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

        testRequest(assert, SERVER_1, {
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
};
