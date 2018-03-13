"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const weakDeepEqual = require("../utils/weakDeepEqual");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const Query = require("../../src/server/Query");

function testRequest(assert, server, requestTest) {
    let query = new Query({
        server, 
        node: server.nodes[ requestTest.reqeustNode ],
        request: requestTest.request
    });
        
    let resultSql = query.toString();
    let result = GrapeQLCoach.parseEntity( resultSql );
    let testResult = GrapeQLCoach.parseEntity( requestTest.result );
        
    let isEqual = !!weakDeepEqual(testResult, result);
    if ( !isEqual ) {
        console.log("break here");
    }
        
    assert.pushResult({
        result: isEqual,
        actual: query.toString(),
        expected: requestTest.result,
        message: JSON.stringify( requestTest.request, null, 4 )
    });
}

let SERVER_1;
const initServer1 = require("../test-servers/server1/index");

QUnit.module("GrapeQL building query", {
    before: async function() {
        SERVER_1 = await initServer1();
    },
    after: async function() {
        await SERVER_1.stop();
    }
}, function() {
    
    QUnit.test("company1", (assert) => {
        
        testRequest(assert, SERVER_1, {
            reqeustNode: "Company",
            request: {
                columns: ["id", "inn", "name"],
                offset: 0,
                limit: 2
            },
                
            result: `
                    select
                        _grape_query_columns."id",
                        _grape_query_columns."inn",
                        _grape_query_columns."name"
                    from company
                    
                    left join lateral (select 
                        company.id as "id",
                        public.company.inn as "inn",
                        coalesce( company.name, '(Не определено)' )  as "name"
                    ) as _grape_query_columns on true
                    
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
                        _grape_query_columns."id",
                        _grape_query_columns."INN"
                    from company
                    
                    left join lateral(select
                        company.id as "id",
                        public.company.inn as "INN"
                    ) as _grape_query_columns on true
                    
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
                        _grape_query_columns."id"
                    from company
                    
                    left join lateral(select
                        company.id as "id"
                    ) as _grape_query_columns on true
                    
                    where
                        _grape_query_columns."id" = 1
                    offset 1
                `
        });
    });

});    
