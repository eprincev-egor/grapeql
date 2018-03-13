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
                    _grape_query_columns."id"
                from public.Order
                
                left join lateral (select
                    public.Order.id as "id"
                ) as _grape_query_columns on true
            `
        });
        
        testRequest(assert, SERVER_1, {
            reqeustNode: "Order",
            request: {
                columns: ["id", "CompanyClient.inn"]
            },
            result: `
                select
                    _grape_query_columns."id",
                    _grape_query_columns."CompanyClient.inn"
                from public.Order
                
                left join company as CompanyClient on
                    CompanyClient.id = public.Order.id_company_client
                
                left join lateral (select
                    public.Order.id as "id",
                    public.company.inn as "inn"
                ) as _grape_query_columns on true
            `
        });
        
        testRequest(assert, SERVER_1, {
            reqeustNode: "Order",
            request: {
                columns: ["id", "CompanyClient.inn", "CompanyClient.id"]
            },
            result: `
                select
                    _grape_query_columns."id",
                    _grape_query_columns."CompanyClient.inn",
                    _grape_query_columns."CompanyClient.id"
                from public.Order
                
                left join company as CompanyClient on
                    CompanyClient.id = public.Order.id_company_client
                
                left join lateral (select
                    public.Order.id as "id",
                    public.company.inn as "inn",
                    public.company.id as "CompanyClient.id"
                ) as _grape_query_columns on true
            `
        });
    });
};
