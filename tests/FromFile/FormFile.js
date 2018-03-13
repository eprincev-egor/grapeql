"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testFromFile(assert, test) {
    assert.ok(false, "in work...");
}



let CompanyNode1 = `
    select *
    from company
`;
let OrderNode1 = `
    select *
    from public.Order
    
    left join ./Company as CompanyClient on
        CompanyClient.id = public.Order.id_company_client
`;

let nodes1 = {
    Company: CompanyNode1,
    Order: OrderNode1
};


module.exports = function(getServers) {
    QUnit.test("server 1", function(assert) {
        let server1 = getServers().server1;
        
        testFromFile(assert, {
            nodes: nodes1,
            
            requestNode: "Order",
            request: {
                columns: ["id"]
            },
            
            result: `
                select
                    _grape_query_columns."id"
                from public.Order
                
                left join lateral (select
                    company.id as "id"
                ) as _grape_query_columns on true
            `
        });
        
        testFromFile(assert, {
            nodes: nodes1,
            
            requestNode: "Order",
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
                    company.id as "id",
                    public.company.inn as "inn"
                ) as _grape_query_columns on true
            `
        });
        
        testFromFile(assert, {
            nodes: nodes1,
            
            requestNode: "Order",
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
                    company.id as "id",
                    public.company.inn as "inn",
                    public.company.id as "id"
                ) as _grape_query_columns on true
            `
        });
    });
};
