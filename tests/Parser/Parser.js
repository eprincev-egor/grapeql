(function(QUnit, GrapeQLCoach) {
    "use strict";
    
    let normolizeSyntaxBeforeEqual = window.normolizeSyntaxBeforeEqual;
    
    let index = 0; // for conditional break point
    function testClass(className, SyntaxClass) {
        QUnit.test(className, (assert) => {
            window.assert = assert;
            SyntaxClass.tests.forEach(test => {
                
                let str = test.str,
                    parseFuncName = "parse" + className;
                
                index++;
                console.log(index);
                
                if ( test.err ) {
                    try {
                        let coach = new GrapeQLCoach(str);
                        coach[ parseFuncName ]();
                        assert.ok(false, "expected error: " + str);
                    } catch(err) {
                        assert.ok(true, "expected error: " + str);
                    }
                } 
                
                else if ( test.result ) {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();
                    
                    normolizeSyntaxBeforeEqual(test.result);
                    normolizeSyntaxBeforeEqual(result);
                    
                    let isEqual = !!window.weakDeepEqual(test.result, result);
                    if ( !isEqual ) {
                        console.log("break here");
                    }
                    
                    assert.pushResult({
                        result: isEqual,
                        actual: result,
                        expected: test.result,
                        message: test.str
                    });
                    
                    
                    // auto test clone and toString
                    let clone = result.clone();
                    let cloneString = clone.toString();
                    let cloneCoach = new GrapeQLCoach( cloneString );
                    let cloneResult = cloneCoach[ parseFuncName ]();
                    
                    normolizeSyntaxBeforeEqual(cloneResult);
                    
                    isEqual = !!window.weakDeepEqual(test.result, result);
                    if ( !isEqual ) {
                        console.log("break here");
                    }
                    
                    assert.pushResult({
                        result: isEqual,
                        actual: cloneResult,
                        expected: test.result,
                        message: "clone: " + test.str
                    });
                }
            });
        });
    }
    
    for (let key in GrapeQLCoach) {
        let SyntaxClass = GrapeQLCoach[ key ];
        
        if ( !SyntaxClass.tests ) {
            continue;
        }
        
        testClass(key, SyntaxClass);
    }
    
    
    
    function testReplaceComments(assert, strFrom, strTo) {
        let coach = new GrapeQLCoach(strFrom);
        coach.replaceComments();
        assert.equal(coach.str, strTo, strFrom);
    }
    
    QUnit.test("replaceComments", function(assert) {
        
        testReplaceComments(assert, "1-- \n1", "1   \n1");
        testReplaceComments(assert, "1-- \r1", "1   \r1");
        testReplaceComments(assert, "1--123\n\r1", "1     \n\r1");
        testReplaceComments(assert, "1+/*\n\r*/2", "1+  \n\r  2");
        testReplaceComments(assert, "1 + /* \n\r */2", "1 +    \n\r   2");
    });
    
    function testGetType(assert, str, result) {
        let coach = new GrapeQLCoach(str);
        let expr = coach.parseExpression();
        let type = expr.getType();
        
        assert.equal( type, result, `${ str }   => ${ result }` );
    }
    
    QUnit.test("Expression.getType()", function(assert) {
        
        testGetType(assert, "0", "integer");
        testGetType(assert, "1", "integer");
        testGetType(assert, "-1", "integer");
        testGetType(assert, "+'1'", "double precision");
        testGetType(assert, "- + '2' - - 1", "double precision");
        
        testGetType(assert, "'2018-01-21 22:02:21.993628'::date::text || '120'::char(2)::text::integer - -8", "text");
        testGetType(assert, "(-1 + 2.1) * '0'::numeric - ( ('-2')::bigint + 8)", "numeric");
    });
    
    QUnit.test("Syntax.findParent", function(assert) {
        
        let coach = new GrapeQLCoach("select id + 1 from table");
        let select = coach.parseSelect();
        let column = select.columns[0];
        
        let parent;
        
        parent = column.findParent(parent => parent instanceof GrapeQLCoach.Select);
        assert.ok(parent === select, "findParent good");
        
        parent = column.expression.elements[0].findParent(parent => parent instanceof GrapeQLCoach.Select);
        assert.ok(parent === select, "findParent good");
    });
    
    
    
    
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
    });
    
})(window.QUnit, window.tests.GrapeQLCoach);
