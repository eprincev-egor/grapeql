(function(QUnit, GrapeQLCoach) {
    "use strict";
    
    QUnit.dump.maxDepth = 100;
    
    function testGetDbColumn(assert, test) {
        let coach;
        
        coach = new GrapeQLCoach(test.link.trim());
        let link = coach.parseObjectLink();
        
        if ( test.error ) {
            try {
                coach = new GrapeQLCoach(test.node.trim());
                let select = coach.parseSelect();
                
                select.getColumnSource({
                    server: test.server
                }, link);
                
                assert.ok(false, `expected error ${ test.link } in
                     ${ test.node }`);
            } catch(err) {
                assert.ok(true, `expected error ${ test.link } in
                     ${ test.node }`);
            }
        } else {
            coach = new GrapeQLCoach(test.node.trim());
            let select = coach.parseSelect();
            
            let source = select.getColumnSource({
                server: test.server
            }, link);
            
            let isEqual = !!window.weakDeepEqual(test.source, source);
            if ( !isEqual ) {
                console.log("break here");
            }
            
            assert.pushResult({
                result: isEqual,
                actual: source,
                expected: test.source,
                message: `find ${ test.link } in
                     ${ test.node }`
            });
        }
        
    }
    
    const SERVER_1 = {
        schemes: {
            public: {
                tables: {
                    company: {
                        columns: {
                            id: {
                                type: "integer",
                                name: "id",
                                table: "company",
                                scheme: "public"
                            },
                            inn: {
                                type: "text",
                                name: "inn",
                                table: "company",
                                scheme: "public"
                            }
                        }
                    },
                    country: {
                        columns: {
                            id: {
                                type: "integer",
                                name: "id",
                                table: "country",
                                scheme: "public"
                            }
                        }
                    },
                    order: {
                        columns: {
                            id: {
                                type: "integer",
                                name: "id",
                                table: "order",
                                scheme: "public"
                            }
                        }
                    }
                }
            },
            test: {
                tables: {
                    company: {
                        columns: {
                            id: {
                                type: "integer",
                                name: "id",
                                table: "company",
                                scheme: "test"
                            }
                        }
                    }
                }
            }
        }
    };
    
    QUnit.test("Select.getDbColumn", function(assert) {
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company", 
            link: "company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company", 
            link: "company.\"id\"",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from \"company\"", 
            link: "company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company, country", 
            link: "country.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.country.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company as \"comp\"", 
            link: "comp.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company as \"comp\"", 
            link: "\"comp\".id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from public.company", 
            link: "company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from public.company", 
            link: "public.company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company", 
            link: "public.company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company, test.company", 
            link: "public.company.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company, test.company", 
            link: "test.company.id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from public.company", 
            link: "id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        // column reference id is ambiguous
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from public.company, test.company", 
            link: "id",
            error: true
        });
        
        // column id1 does not exist
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from public.company, test.company", 
            link: "id1",
            error: true
        });
        
        // table name company specified more than once
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from company, company", 
            link: "company.id",
            error: true
        });
        
        // invalid reference public.company.id to FROM-clause entry for table company
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from test.company as company", 
            link: "public.company.id",
            error: true
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from (select * from public.company) as comp", 
            link: "comp.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from (select * from public.company) as comp", 
            link: "id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from (select * from (select * from public.company) as comp2) as comp1", 
            link: "comp1.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from test.company left join (select * from (select * from public.company) as comp2) as comp1 on true", 
            link: "comp1.id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select *, company.id as id_clone from public.company", 
            link: "id_clone",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select *, company.id + 1 as id1 from public.company", 
            link: "id1",
            source: {expression: {elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {operator: "+"},
                {number: "1"}
            ]}}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select * from (select 1 as id) as user_admin",
            link: "user_admin.id",
            source: {expression: {elements: [
                {number: "1"}
            ]}}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with company as (
                select *
                from test.company
            )
                select *
                from company
            `,
            link: "id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with company as (
                select *
                from company
            )
                select *
                from company
            `,
            link: "id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with 
                
                company1 as (
                    select *
                    from test.company
                ),
                
                company2 as (
                    select *
                    from company1
                )
                
                select *
                from company2
            `,
            link: "id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with 
                
                company1 as (
                    select *
                    from test.company
                ),
                
                company2 as (
                    with 
                        sub_company1 as (
                            select *
                            from company1
                        ),
                        sub_company2 as (
                            select *
                            from sub_company1
                        )
                    
                    select *
                    from sub_company2
                )
                
                select *
                from company2
            `,
            link: "id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `select
                    lastOrder.*
                from company
        
                left join lateral (
                    select
                        company.id as company_id
                    from public.order
        
                    limit 1
                ) as lastOrder on true
            `,
            link: "company_id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with 
                company as (
                    select *
                    from test.company
                )
                
                select
                    lastOrder.*
                from company
        
                left join lateral (
                    select
                        company.id as company_id
                    from public.order
        
                    limit 1
                ) as lastOrder on true
            `,
            link: "company_id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: `with 
                company as (
                    select *
                    from test.company
                )
                
                select
                    lastOrder.*
                from company
        
                left join (
                    select
                        company.id as company_id
                    from public.order
        
                    limit 1
                ) as lastOrder on true
            `,
            link: "company_id",
            error: true
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select id as id from company", 
            link: "id",
            source: {dbColumn: SERVER_1.schemes.public.tables.company.columns.id}
        });
        
        testGetDbColumn(assert, {
            server: SERVER_1,
            node: "select id as id from test.company", 
            link: "id",
            source: {dbColumn: SERVER_1.schemes.test.tables.company.columns.id}
        });
        
    });
    
})(window.QUnit, window.tests.GrapeQLCoach);
