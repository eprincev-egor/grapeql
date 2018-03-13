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

module.exports = function(getServers) {
    QUnit.test("server 1", function(assert) {
        const SERVER_1 = getServers().server1;
        
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
                
                left join (select * from country limit 1) as country on true
                
                order by country.id
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join (select * from country limit 1) as country on true
                
                group by country.id
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join (select * from country limit 1) as country on true
                
                group by cube (company.id, (country.id, 1))
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join (select * from country limit 1) as country on true
                
                group by rollup (company.id, (country.id, 1))
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select from company
                
                left join (select * from country limit 1) as country on true
                
                group by GROUPING SETS (company.id, country.code)
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    cast( country.id as bigint )
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    company.id in (country.id)
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    company.id between country.id and 2
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    company.id between 1 and country.id
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    (case
                        when country.id is not null
                        then 1
                    end) as some
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    (case
                        when true
                        then 1
                        else country.id
                    end) as some
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    (case
                        when true
                        then country.id
                    end) as some
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    coalesce(1, country.id)
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
                select
                    lower(country.code)
                from company
                
                left join (select * from country limit 1) as country on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join company on
                company.id = comp_id.id
            
            left join lateral (
                select * from (
                    select 
                        russia_country.id as id_country
                    from country as russia_country

                    where
                        russia_country.id = 1
                    
                ) as some_table
            ) as some_table on true
            
        `, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join lateral (
                select * from (
                    select 
                        russia_country.id as id_country
                    from country as russia_country

                    where
                        russia_country.id = 1
                    
                ) as some_table
            ) as some_table on true
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join company on
                company.id = comp_id.id
            
            left join lateral (
                select * from (
                    select 
                        russia_country.id as id_country
                    from country as russia_country

                    where
                        russia_country.id = 1
                    
                    union
                    
                    select 
                        company.id as id_country
                ) as some_table
            ) as some_table on true
            
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join company on
                company.id = comp_id.id
            
            left join lateral (
                select * from (
                    select 
                        russia_country.id as id_country
                    from country as russia_country

                    where
                        russia_country.id = 1
                    
                    union
                    
                    select 
                        company.id as id_country
                ) as some_table
                
                limit 1
            ) as some_table on true
            
        `, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join company on
                company.id = comp_id.id
            
            left join lateral (
                select * from (
                    with 
                		test as (
                			select
                				company.name
                		)
                	select * from test
                ) as some_table
            ) as some_table on true
            
        `, SERVER_1);
        
        testRemoveUnnesaryJoins(assert, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
            
            left join company on
                company.id = comp_id.id
            
            left join lateral (
                select * from (
                    with 
                		test as (
                			select
                				company.name
                		)
                	select * from test
                ) as some_table
                
                limit 1
            ) as some_table on true
            
        `, `
            select
                comp_id.id
            from (select 1 as id) as comp_id
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
};
