(function(QUnit, GrapeQLCoach) {
    "use strict";
    
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
            
            assert.deepEqual(source, test.source, `find ${ test.link } in
                 ${ test.node }`);
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
    
    QUnit.test("Selec.getDbColumn", function(assert) {
        
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
    });
    
})(window.QUnit, window.tests.GrapeQLCoach);
