"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}
    
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testRemoveUnnesaryJoins(assert, fromSelect, toSelect, server) {
    if ( !server ) {
        server = toSelect;
        toSelect = fromSelect;
    }
        
    let coach;
        
    coach = new GrapeQLCoach(fromSelect);
    coach.skipSpace();
    let parsedFromSelect = coach.parseSelect();
        
    coach = new GrapeQLCoach(toSelect);
    coach.skipSpace();
    let parsedToSelect = coach.parseSelect();
        
    parsedFromSelect.removeUnnesaryJoins({server});
        
    let isEqual = !!weakDeepEqual(parsedFromSelect, parsedToSelect);
    if ( !isEqual ) {
        console.log("break here");
    }
        
    assert.pushResult({
        result: isEqual,
        actual: parsedFromSelect.toString(),
        expected: parsedToSelect.toString(),
        message: `
                ${ fromSelect }
                --------------------------->
                ${ toSelect }
            `
    });
}

let SERVER_1;
const initServer1 = require("../test-servers/server1/index");

QUnit.module("Select.removeUnnesaryJoins", {
    before: async function() {
        SERVER_1 = await initServer1();
    }
}, function() {
    
    QUnit.test("server 1", function(assert) {
        
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join country on
                    country.id = company.id_country
            `, `
                select from company
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join country on
                    country.id = company.id_country
                    
                where country.id > 3
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join country on
                    country.id = company.id_country
                    
                left join company as company2 on
                    company2.id_country = country.id
                    
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
            `, `
                select from public.order as orders
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select
                    partner_link.*
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select
                    *
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select
                    (company_client.id + partner_link.id_order + some.one)
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
                left join lateral (
                    select 
                        1 as one
                ) as some on true
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                
                left join lateral (
                    select 
                        1 as one
                ) as some on true
            `, `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders
                
                left join company as company_client on
                    company_client.id = orders.id_company_client
                
                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join (select * from country limit 1) as country on true
            `, `
                select from company
            `, SERVER_1);
            
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join public.order as orders on
                    orders.id_company_client = company.id
                
                left join lateral (
                    select * 
                    from country 
                    where 
                        country.id in (
                            orders.id_country_start,
                            orders.id_country_end
                        )
                    limit 1
                ) as country on true
            `, `
                select from company
                
                left join public.order as orders on
                    orders.id_company_client = company.id
                
            `, SERVER_1);
    });

});
