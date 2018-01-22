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
                try {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();
                    
                    if ( test.result ) {
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
                    }
                } catch(err) {
                    if ( test.error ) {
                        assert.ok(true, str);
                    } else {
                        console.log(index, err);
                        assert.ok(false, str + "\n " + err);
                    }
                }
                
            });
        });
    }
    
    GrapeQLCoach.As.tests = [
        {
            str: "nice",
            result: {
                alias: {word: "nice"}
            }
        },
        {
            str: "\" Yep\"",
            result: {
                alias: {
                    content: " Yep"
                }
            }
        },
        {
            str: "as Some1",
            result: {
                alias: {word: "some1"}
            }
        },
        {
            str: "as \"order\"",
            result: {
                alias: {
                    content: "order"
                }
            }
        },
        {
            str: "as from",
            error: Error
        }
    ];
    
    GrapeQLCoach.Boolean.tests = [
        {
            str: "true",
            result: {
                boolean: true
            }
        },
        {
            str: "false",
            result: {
                boolean: false
            }
        }
    ];
    
    GrapeQLCoach.CaseWhen.tests = [
        {
            str: "case when (true) then 1 else 0 end",
            result: {
                case: [
                    {
                        when: {elements: [{boolean: true}]},
                        then: {elements: [{number: "1"}]}
                    }
                ],
                else: {elements: [{number: "0"}]}
            }
        },
        
        {
            str: "case when 'some' then (1+1) when true or false then (1+1) else -2 end",
            result: {
                case: [
                    {
                        when: {elements: [{content: "some"}]},
                        then: {elements: [
                            {number: "1"},
                            {operator: "+"},
                            {number: "1"}
                        ]}
                    },
                    {
                        when: {elements: [
                            {boolean: true},
                            {operator: "or"},
                            {boolean: false}
                        ]},
                        then: {elements: [
                            {number: "1"},
                            {operator: "+"},
                            {number: "1"}
                        ]}
                    }
                ],
                else: {elements: [
                    {operator: "-"},
                    {number: "2"}
                ]}
            }
        }
    ];
    
    GrapeQLCoach.CaseWhenElement.tests = [
        {
            str: "when true then 1",
            result: {
                when: {elements: [{boolean: true}]},
                then: {elements: [{number: "1"}]}
            }
        }
    ];
    
    GrapeQLCoach.Cast.tests = [
        {
            str: "cast(1 as numeric( 12, 12 ))",
            result: {
                dataType: {
                    type: "numeric(12,12)"
                },
                expression: {
                    elements: [
                        {
                            number: "1"
                        }
                    ]
                }
            }
        },
        {
            str: "cast('nice' as bigint[][])",
            result: {
                dataType: {
                    type: "bigint[][]"
                },
                expression: {
                    elements: [
                        {
                            content: "nice"
                        }
                    ]
                }
            }
        },
        {
            str: "cast( $$nice$$  AS bigint[][])",
            result: {
                dataType: {
                    type: "bigint[][]"
                },
                expression: {
                    elements: [
                        {
                            content: "nice"
                        }
                    ]
                }
            }
        },
        {
            str: "cast( 2 * 3 AS bigint[][])",
            result: {
                dataType: {
                    type: "bigint[][]"
                },
                expression: {
                    elements: [
                        {
                            number: "2"
                        },
                        {
                            operator: "*"
                        },
                        {
                            number: "3"
                        }
                    ]
                }
            }
        }
    ];
    
    GrapeQLCoach.Column.tests = [
        {
            str: "company.id as id",
            result: {
                expression: {
                    elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]
                },
                as: { alias: {word: "id"} }
            }
        },
        {
            str: "null nulL1",
            result: {
                expression: {
                    elements: [
                        {null: true}
                    ]
                },
                as: { alias: {word: "null1"} }
            }
        },
        {
            str: "*",
            result: {
                expression: {
                    elements: [
                        {link: [
                            "*"
                        ]}
                    ]
                }
            }
        }
    ];
    
    GrapeQLCoach.Comment.tests = [
        {
            str: "--123\n",
            result: {content: "123"}
        },
        {
            str: "--123\r",
            result: {content: "123"}
        },
        {
            str: "/*123\n456*/",
            result: {content: "123\n456"}
        },
        {
            str: "/*123\r456*/",
            result: {content: "123\r456"}
        }
    ];
    
    GrapeQLCoach.DataType.tests = [
        {
            str: "numeric  ( 10 )",
            result: {type: "numeric(10)"}
        },
        {
            str: "numeric ( 10, 3 )",
            result: {type: "numeric(10,3)"}
        },
        {
            str: "bigint[ ]",
            result: {
                type: "bigint[]"
            }
        },
        {
            str: "bigint [ 1 ]",
            result: {
                type: "bigint[1]"
            }
        }
    ];
    
    GrapeQLCoach.DoubleQuotes.tests = [
        {
            str: "\"test\"",
            result: {content: "test"}
        },
        {
            str: "\"test\"\"\"",
            result: {content: "test\""}
        },
        {
            str: "U&\"d\\0061t\\+000061 test\"",
            result: {content: "data test"}
        },
        {
            str: "u&\"d\\0061t\\+000061 test\"",
            result: {content: "data test"}
        },
        {
            str: "U&\"d!0061t!+000061\" UESCAPE '!'",
            result: {content: "data"}
        },
        {
            str: "U&\"\\006\"",
            error: Error
        },
        {
            str: "U&\"\\006ф\"",
            error: Error
        },
        {
            str: "\"\" uescape '!'",
            error: Error
        },
        {
            str: "u&\"\" uescape '+'",
            error: Error
        },
        {
            str: "u&\"\" uescape '-'",
            error: Error
        },
        {
            str: "u&\"\" uescape '''",
            error: Error
        },
        {
            str: "u&\"\" uescape '\"'",
            error: Error
        },
        {
            str: "u&\"\" uescape ' '",
            error: Error
        },
        {
            str: "u&\"\" uescape '\n'",
            error: Error
        },
        {
            str: "u&\"\" uescape '\t'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'a'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'b'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'c'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'd'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'e'",
            error: Error
        },
        {
            str: "u&\"\" uescape 'f'",
            error: Error
        },
        {
            str: "u&\"\" uescape '0'",
            error: Error
        },
        {
            str: "u&\"\" uescape '9'",
            error: Error
        }
    ];
    
    GrapeQLCoach.Expression.tests = [
        {
            str: "1 + 1",
            result: {
                elements: [
                    {number: "1"},
                    {operator: "+"},
                    {number: "1"}
                ]
            }
        },
        {
            str: "1::text::bigint-2 ",
            result: {
                elements: [
                    {number: "1"},
                    {dataType: {type: "text"}},
                    {dataType: {type: "bigint"}},
                    {operator: "-"},
                    {number: "2"}
                ]
            }
        },
        {
            str: "{user}::bigint % 4",
            result: {
                elements: [
                    {name: "user"},
                    {dataType: {type: "bigint"}},
                    {operator: "%"},
                    {number: "4"}
                ]
            }
        },
        {
            str: "$$test$$ || E'str'",
            result: {
                elements: [
                    {content: "test"},
                    {operator: "||"},
                    {content: "str"}
                ]
            }
        },
        {
            str: "true-false*null+1/'test'",
            result: {
                elements: [
                    {boolean: true},
                    {operator: "-"},
                    {boolean: false},
                    {operator: "*"},
                    {null: true},
                    {operator: "+"},
                    {number: "1"},
                    {operator: "/"},
                    {content: "test"}
                ]
            }
        },
        {
            str: "((('extrude')))",
            result: {
                elements: [
                    {content: "extrude"}
                ]
            }
        },
        {
            str: "(-1+2.1)*''-(('test')+8)",
            result: {
                elements: [
                    {
                        elements: [
                            {operator: "-"},
                            {number: "1"},
                            {operator: "+"},
                            {number: "2.1"}
                        ]
                    },
                    {operator: "*"},
                    {content: ""},
                    {operator: "-"},
                    {
                        elements: [
                            {elements: [
                                {content: "test"}
                            ]},
                            {operator: "+"},
                            {number: "8"}
                        ]
                    }
                ]
            }
        },
        {
            str: "order.sum + Company.total",
            result: {
                elements: [
                    {link: [
                        {word: "order"},
                        {word: "sum"}
                    ]},
                    {operator: "+"},
                    {link: [
                        {word: "company"},
                        {word: "total"}
                    ]}
                ]
            }
        },
        {
            str: "now()::date + 3",
            result: {
                elements: [
                    {
                        "function": {link: [{ word: "now" }]},
                        "arguments": []
                    },
                    {
                        dataType: {type: "date"}
                    },
                    {
                        operator: "+"
                    },
                    {
                        number: "3"
                    }
                ]
            }
        },
        {
            str: "id = 2 or id = -3",
            result: {
                elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {number: "2"},
                    
                    {operator: "or"},
                    
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {operator: "-"},
                    {number: "3"}
                ]
            }
        },
        {
            str: "id = 2 or - -+id = 3",
            result: {
                elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {number: "2"},
                    
                    {operator: "or"},
                    
                    {operator: "-"},
                    {operator: "-"},
                    {operator: "+"},
                    
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {number: "3"}
                ]
            }
        }
    ];
    
    GrapeQLCoach.File.tests = [
        {
            str: "file Order",
            result: {
                path: [
                    {name: "."},
                    {name: "Order"}
                ]
            }
        },
        {
            str: "./Order",
            result: {
                path: [
                    {name: "."},
                    {name: "Order"}
                ]
            }
        },
        {
            str: "../Order",
            result: {
                path: [
                    {name: ".."},
                    {name: "Order"}
                ]
            }
        },
        {
            str: "file Order.sql",
            result: {
                path: [
                    {name: "."},
                    {name: "Order.sql"}
                ]
            }
        },
        {
            str: "file \" nice \"",
            result: {
                path: [
                    {name: "."},
                    {content: " nice "}
                ]
            }
        },
        {
            str: "file some / file on",
            result: {
                path: [
                    {name: "."},
                    {name: "some"},
                    {name: "file"}
                ]
            }
        },
        {
            str: "file /root.sql",
            result: {
                path: [
                    {name: "root.sql"}
                ]
            }
        },
        {
            str: "/root.sql",
            result: {
                path: [
                    {name: "root.sql"}
                ]
            }
        },
        {
            str: "file ./company",
            result: {
                path: [
                    {name: "."},
                    {name: "company"}
                ]
            }
        }
    ];
    
    GrapeQLCoach.FromItem.test = [
        {
            str: "public.company",
            result: {
                table: {link: [
                    {word: "public"},
                    {word: "company"}
                ]}
            }
        },
        {
            str: "public.company as Company",
            result: {
                as: {alias: {word: "company"}},
                table: {link: [
                    {word: "public"},
                    {word: "company"}
                ]}
            }
        },
        {
            str: "public.company as Company ( id, inn )",
            result: {
                as: {alias: {word: "company"}},
                table: {link: [
                    {word: "public"},
                    {word: "company"}
                ]},
                columns: [
                    {word: "id"},
                    {word: "inn"}
                ]
            }
        },
        {
            str: "( select * from public.order ) as Orders",
            result: {
                select: {
                    columns: [
                        {
                            as: null,
                            expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}
                        }
                    ],
                    from: [{
                        table: {link: [
                            {word: "public"},
                            {word: "order"}
                        ]},
                        as: {alias: null}
                    }]
                },
                as: {alias: {word: "orders"}}
            }
        },
        {
            str: "lateral (select * from company) as company (id, inn)",
            result: {
                lateral: true,
                select: {
                    columns: [
                        {
                            as: null,
                            expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}
                        }
                    ],
                    from: [{
                        table: {link: [
                            {word: "company"}
                        ]},
                        as: {alias: null}
                    }]
                },
                as: {alias: {word: "company"}},
                columns: [
                    {word: "id"},
                    {word: "inn"}
                ]
            }
        },
        {
            str: "lateral public.get_rows(1 + 1, null) with ordinality as some_rows",
            result: {
                lateral: true,
                withOrdinality: true,
                functionCall: {
                    "function": {link: [
                        { word: "public" },
                        { word: "get_rows" }
                    ]},
                    "arguments": [
                        {elements: [
                            {number: "1"},
                            {operator: "+"},
                            {number: "1"}
                        ]},
                        {elements: [
                            {null: true}
                        ]}
                    ]
                },
                as: {
                    alias: {word: "some_rows"}
                }
            }
        },
        {
            str: "file Order.sql as orders",
            result: {
                file: {
                    path: [
                        {name: "."},
                        {name: "Order.sql"}
                    ]
                },
                as: {alias: {word: "orders"}}
            }
        }
    ];
    
    GrapeQLCoach.FunctionCall.tests = [
        {
            str: "public.get_totals( company.id, 1 + 2 )",
            result: {
                "function": {link: [
                    {word: "public"},
                    {word: "get_totals"}
                ]},
                "arguments": [
                    {
                        elements: [
                            {link: [
                                {word: "company"},
                                {word: "id"}
                            ]}
                        ]
                    },
                    {
                        elements: [
                            {number: "1"},
                            {operator: "+"},
                            {number: "2"}
                        ]
                    }
                ]
            }
        }
    ];
    
    GrapeQLCoach.GroupByElement.tests = [
        {
            str: "id",
            result: {
                expression: {elements: [
                    {link: [
                        {word: "id"}
                    ]}
                ]}
            }
        },
        {
            str: "GROUPING SETS (brand, size, ( ))",
            result: {
                groupingSets: [
                    {expression: {elements: [
                        {link: [
                            {word: "brand"}
                        ]}
                    ]}},
                    {expression: {elements: [
                        {link: [
                            {word: "size"}
                        ]}
                    ]}},
                    {isEmpty: true}
                ]
            }
        },
        {
            str: "cube ( brand, (size, 1) )",
            result: {
                cube: [
                    {elements: [
                        {link: [
                            {word: "brand"}
                        ]}
                    ]},
                    [
                        {elements: [
                            {link: [
                                {word: "size"}
                            ]}
                        ]},
                        {elements: [
                            {number: "1"}
                        ]}
                    ]
                ]
            }
        },
        {
            str: "rollup ( brand, (size, 1) )",
            result: {
                rollup: [
                    {elements: [
                        {link: [
                            {word: "brand"}
                        ]}
                    ]},
                    [
                        {elements: [
                            {link: [
                                {word: "size"}
                            ]}
                        ]},
                        {elements: [
                            {number: "1"}
                        ]}
                    ]
                ]
            }
        }
    ];

    GrapeQLCoach.Join.tests = [
        {
            str: "left join country on country.id = company.countryId",
            result: {
                type: "left join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {link: [
                        {word: "country"},
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {link: [
                        {word: "company"},
                        {word: "countryid"}
                    ]}
                ]}
            }
        },
        {
            str: "Inner  Join country on true",
            result: {
                type: "inner join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "join country on true",
            result: {
                type: "join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "cross join country on true",
            result: {
                type: "cross join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "full outer join country on true",
            result: {
                type: "full outer join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "left outer join country on true",
            result: {
                type: "left outer join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "right outer join country on true",
            result: {
                type: "right outer join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "full outer join country on true",
            result: {
                type: "full outer join",
                from: {
                    table: {link: [
                        {word: "country"}
                    ]}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "right join public.country as country using a1.\"X,\", b2 .y, \"c3\". z",
            result: {
                type: "right join",
                from: {
                    table: {link: [
                        {word: "public"},
                        {word: "country"}
                    ]},
                    as: {alias: {word: "country"}}
                }, 
                using: [
                    {link: [
                        {word: "a1"},
                        {content: "X,"}
                    ]},
                    {link: [
                        {word: "b2"},
                        {word: "y"}
                    ]},
                    {link: [
                        {content: "c3"},
                        {word: "z"}
                    ]}
                ]
            }
        },
        {
            str: "left join lateral (select * from company) as sub_company on true",
            result: {
                type: "left join",
                from: {
                    lateral: true,
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {link: [
                                        "*"
                                    ]}
                                ]}
                            }
                        ],
                        from: [{
                            table: {link: [
                                {word: "company"}
                            ]}
                        }]
                    },
                    as: {
                        alias: {word: "sub_company"}
                    }
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "left join ./Company.sql as company on true",
            result: {
                type: "left join",
                from: {
                    file: {
                        path: [
                            {name: "."},
                            {name: "Company.sql"}
                        ]
                    },
                    as: {alias: {word: "company"}}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "right join lateral unnest( company.orders_ids ) as order_id on true",
            error: Error
        },
        {
            str: "full join lateral unnest( company.orders_ids ) as order_id on true",
            error: Error
        },
        {
            str: "left join lateral unnest( company.orders_ids ) as order_id on true",
            result: {
                type: "left join",
                from: {
                    lateral: true,
                    functionCall: {
                        "function": {
                            link: [
                                {word: "unnest"}
                            ]
                        },
                        "arguments": [{elements: [
                            {link: [
                                {word: "company"},
                                {word: "orders_ids"}
                            ]}
                        ]}]
                    },
                    as: {alias: {word: "order_id"}}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        },
        {
            str: "join lateral unnest( company.orders_ids ) as order_id on true",
            result: {
                type: "join",
                from: {
                    lateral: true,
                    functionCall: {
                        "function": {
                            link: [
                                {word: "unnest"}
                            ]
                        },
                        "arguments": [{elements: [
                            {link: [
                                {word: "company"},
                                {word: "orders_ids"}
                            ]}
                        ]}]
                    },
                    as: {alias: {word: "order_id"}}
                },
                on: {elements: [
                    {boolean: true}
                ]}
            }
        }
    ];
    
    GrapeQLCoach.ObjectLink.tests = [
        {
            str: "a.B.c",
            result: {
                link: [
                    {word: "a"},
                    {word: "b"},
                    {word: "c"}
                ]
            }
        },
        {
            str: `"Nice"
            .
            "test"   . X.y."some"
            `,
            result: {
                link: [
                    {content: "Nice"},
                    {content: "test"},
                    {word: "x"},
                    {word: "y"},
                    {content: "some"}
                ]
            }
        }
    ];
    
    GrapeQLCoach.ObjectName.tests = [
        {
            str: "a",
            result: {
                name: {word: "a"}
            }
        },
        {
            str: "\"Nice\"",
            result: {
                name: {
                    content: "Nice"
                }
            }
        }
    ];
    
    GrapeQLCoach.Operator.tests = [
        {
            str: "+",
            result: {operator: "+"}
        },
        {
            str: ">= ",
            result: {operator: ">="}
        },
        {
            str: "<> ",
            result: {operator: "<>"}
        },
        {
            str: "and",
            result: {operator: "and"}
        },
        {
            str: "or",
            result: {operator: "or"}
        },
        {
            str: "not",
            result: {operator: "not"}
        },
        {
            str: "is",
            result: {operator: "is"}
        },
        {
            str: "is  Not null",
            result: {operator: "is not"}
        },
        {
            str: "is Distinct from",
            result: {operator: "is distinct from"}
        },
        {
            str: "operator( pg_catalog.+  )",
            result: {operator: "operator(pg_catalog.+)"}
        }
    ];
    
    GrapeQLCoach.OrderByElement.tests = [
        {
            str: "id Desc",
            result: {
                expression: {elements: [
                    {link: [
                        {word: "id"}
                    ]}
                ]},
                vector: "desc"
            }
        }
    ];
    
    GrapeQLCoach.PgNull.tests = [
        {
            str: "null",
            result: {null: true}
        },
        {
            str: "null ",
            result: {null: true}
        },
        {
            str: "null1",
            error: Error
        }
    ];
    
    GrapeQLCoach.PgNumber.tests = [
        {
            str: "1",
            result: {number: "1"}
        },
        {
            str: "1234567890",
            result: {number: "1234567890"}
        },
        {
            str: "3.2",
            result: {number: "3.2"}
        },
        {
            str: "5e2",
            result: {number: "5e2"}
        },
        {
            str: ".001",
            result: {number: ".001"}
        },
        {
            str: "1.925e-3",
            result: {number: "1.925e-3"}
        },
        {
            str: "1.925e+3",
            result: {number: "1.925e+3"}
        }
    ];
    
    GrapeQLCoach.PgString.tests = [
        {
            str: "'hello ''world'''",
            result: {content: "hello 'world'"}
        },
        {
            str: "'hello'\n'world'",
            result: {content: "helloworld"}
        },
        {
            str: "'hello'\r'world'",
            result: {content: "helloworld"}
        },
        {
            str: "'hello'\n\r'world'",
            result: {content: "helloworld"}
        },
        {
            str: "'hello' \n\r 'world' \n\r 'world'",
            result: {content: "helloworldworld"}
        },
        {
            str: "E'\\\\'",
            result: {content: "\\"}
        },
        {
            str: "E'\\n'",
            result: {content: "\n"}
        },
        {
            str: "E'\\r'",
            result: {content: "\r"}
        },
        {
            str: "E'\\b'",
            result: {content: "\b"}
        },
        {
            str: "E'\\f'",
            result: {content: "\f"}
        },
        {
            str: "E'\\t'",
            result: {content: "\t"}
        },
        {
            str: "E'\\U000061b'",
            result: {content: "ab"}
        },
        {
            str: "E'\\U00006aa'",
            result: {content: "ja"}
        },
        {
            str: "E'\\U00006A'",
            result: {content: "j"}
        },
        {
            str: "E'\\u0061'",
            result: {content: "a"}
        },
        {
            str: "E'\\061a'",
            result: {content: "1a"}
        },
        {
            str: "U&'d\\0061t\\+000061 test'",
            result: {content: "data test"}
        },
        {
            str: "u&'d\\0061t\\+000061 test'",
            result: {content: "data test"}
        },
        {
            str: "U&'d!0061t!+000061' UESCAPE '!'",
            result: {content: "data"}
        },
        {
            str: "U&'\\006'",
            error: Error
        },
        {
            str: "b'01'",
            result: {content: "01"}
        },
        {
            str: "b''",
            result: {content: ""}
        },
        {
            str: "b'01a'",
            error: Error
        },
        {
            str: "x'af'",
            result: {content: "10101111"}
        },
        {
            str: "x'a'\n'f'",
            result: {content: "10101111"}
        },
        {
            str: "x''",
            result: {content: ""}
        },
        {
            str: "x'01x'",
            error: Error
        },
        {
            str: "$$hello'world$$",
            result: {content: "hello'world"}
        },
        {
            str: "$Tag_1$hello'world$Tag_1$",
            result: {content: "hello'world"}
        },
        {
            str: "$Tag_1$$tag_1$$Tag_1$",
            result: {content: "$tag_1$"}
        },
        {
            str: "$$\n\r$$",
            result: {content: "\n\r"}
        },
        {
            str: "$q$[\\t\\r\\n\\v\\\\]$q$",
            result: {content: "[\\t\\r\\n\\v\\\\]"}
        }
    ];
    
    GrapeQLCoach.Select.tests = [
        {
            str: "select * from company",
            result: {
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {
                        alias: null
                    }
                }]
            }
        },
        {
            str: "select company.id as id, null as n from public.company",
            result: {
                columns: [
                    {
                        as: {alias: {word: "id"}},
                        expression: {elements: [
                            {link: [
                                {word: "company"},
                                {word: "id"}
                            ]}
                        ]}
                    },
                    {
                        as: {alias: {word: "n"}},
                        expression: {elements: [
                            {null: true}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "public"},
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }]
            }
        },
        {
            str: "select from company where id = 1",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                where: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {number: "1"}
                ]}
            }
        },
        {
            str: "select from company having id = 1",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                having: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {number: "1"}
                ]}
            }
        },
        {
            str: "select from company offset 1 limit 10",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                offset: 1,
                limit: 10
            }
        },
        {
            str: "select from company limit all offset 100",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                offset: 100,
                limit: "all"
            }
        },
        {
            str: "select from company fetch first 5 rows only",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                fetch: {first: 5}
            }
        },
        {
            str: "select from company fetch next 1 row only",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {alias: null}
                }],
                fetch: {next: 1}
            }
        },
        {
            str: "with orders as (select * from company) select * from orders",
            result: {
                with: [
                    {
                        name: {word: "orders"},
                        select: {
                            columns: [
                                {
                                    as: null,
                                    expression: {elements: [
                                        {link: [
                                            "*"
                                        ]}
                                    ]}
                                }
                            ],
                            from: [{
                                table: {link: [
                                    {word: "company"}
                                ]},
                                as: {
                                    alias: null
                                }
                            }]
                        }
                    }
                ],
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "orders"}
                    ]},
                    as: {
                        alias: null
                    }
                }]
            }
        },
        {
            str: "select * from company as company (id, inn)",
            result: {
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: { alias: {word: "company"} },
                    columns: [
                        {word: "id"},
                        {word: "inn"}
                    ]
                }]
            }
        },
        {
            str: "select * from company union all select * from company",
            result: {
                columns: [
                    {
                        as: null,
                        expression: {elements: [
                            {link: [
                                "*"
                            ]}
                        ]}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {
                        alias: null
                    }
                }],
                union: {
                    all: true,
                    select: {
                        columns: [
                            {
                                as: null,
                                expression: {elements: [
                                    {link: [
                                        "*"
                                    ]}
                                ]}
                            }
                        ],
                        from: [{
                            table: {link: [
                                {word: "company"}
                            ]},
                            as: {
                                alias: null
                            }
                        }]
                    }
                }
            }
        },
        {
            str: "select from company order by inn asc, id desc",
            result: {
                columns: [],
                from: [{
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {
                        alias: null
                    }
                }],
                orderBy: [
                    {
                        expression: {elements: [
                            {link: [
                                {word: "inn"}
                            ]}
                        ]},
                        vector: "asc"
                    },
                    {
                        expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]},
                        vector: "desc"
                    }
                ]
            }
        },
        {
            str: "SELECT brand, size, sum(sales) FROM items_sold GROUP BY GROUPING SETS ((brand), (size), ())",
            result: {
                columns: [
                    {
                        expression: {elements: [
                            {link: [
                                {word: "brand"}
                            ]}
                        ]},
                        as: null
                    },
                    {
                        expression: {elements: [
                            {link: [
                                {word: "size"}
                            ]}
                        ]},
                        as: null
                    },
                    {
                        expression: {elements: [
                            {
                                "function": {link: [
                                    {word: "sum"}
                                ]},
                                "arguments": [
                                    {elements: [
                                        {link: [
                                            {word: "sales"}
                                        ]}
                                    ]}
                                ]
                            }
                        ]},
                        as: null
                    }
                ],
                from: [
                    {
                        table: {link: [{word: "items_sold"}]},
                        as: {alias: null}
                    }
                ],
                groupBy: [
                    {
                        groupingSets: [
                            {expression: {elements: [
                                {link: [
                                    {word: "brand"}
                                ]}
                            ]}},
                            {expression: {elements: [
                                {link: [
                                    {word: "size"}
                                ]}
                            ]}},
                            {isEmpty: true}
                        ]
                    }
                ]
            }
        },
        {
            str: `select
                company.*,
                totals.*,
                country.name,
                partner_country.name
            from company
            
            left join country on 
                company.country_id = country.id
            
            left join company as partner on
                partner.id = company.partner_id
            
            left join country as partner_country on 
                partner.country_id = partner_country.id
            
            left join lateral (
                select
                    sum(sale) as sum_sale
                from orders
                
                where
                    orders.company_id = company.id or
                    orders.company_id = partner.id
            ) as totals on true
            `,
            result: {
                columns: [
                    {expression: {elements: [
                        {link: [
                            {word: "company"},
                            "*"
                        ]}
                    ]}},
                    {expression: {elements: [
                        {link: [
                            {word: "totals"},
                            "*"
                        ]}
                    ]}},
                    {expression: {elements: [
                        {link: [
                            {word: "country"},
                            {word: "name"}
                        ]}
                    ]}},
                    {expression: {elements: [
                        {link: [
                            {word: "partner_country"},
                            {word: "name"}
                        ]}
                    ]}}
                ],
                from: [{
                    table: {link: [{word: "company"}]}
                }],
                joins: [
                    {
                        type: "left join",
                        from: {
                            table: {link: [
                                {word: "country"}
                            ]}
                        },
                        on: {elements: [
                            {link: [
                                {word: "company"},
                                {word: "country_id"}
                            ]},
                            {operator: "="},
                            {link: [
                                {word: "country"},
                                {word: "id"}
                            ]}
                        ]}
                    },
                    {
                        type: "left join",
                        from: {
                            table: {link: [
                                {word: "company"}
                            ]},
                            as: {alias: {word: "partner"}}
                        },
                        on: {elements: [
                            {link: [
                                {word: "partner"},
                                {word: "id"}
                            ]},
                            {operator: "="},
                            {link: [
                                {word: "company"},
                                {word: "partner_id"}
                            ]}
                        ]}
                    },
                    {
                        type: "left join",
                        from: {
                            table: {link: [
                                {word: "country"}
                            ]},
                            as: {alias: {word: "partner_country"}}
                        },
                        on: {elements: [
                            {link: [
                                {word: "partner"},
                                {word: "country_id"}
                            ]},
                            {operator: "="},
                            {link: [
                                {word: "partner_country"},
                                {word: "id"}
                            ]}
                        ]}
                    },
                    {
                        type: "left join",
                        from: {
                            lateral: true,
                            select: {
                                columns: [
                                    {
                                        expression: {elements: [
                                            {
                                                "function": {link: [
                                                    {word: "sum"}
                                                ]},
                                                "arguments": [
                                                    {elements: [
                                                        {link: [
                                                            {word: "sale"}
                                                        ]}
                                                    ]}
                                                ]
                                            }
                                        ]},
                                        as: {alias: {word: "sum_sale"}}
                                    }
                                ],
                                from: [{
                                    table: {link: [
                                        {word: "orders"}
                                    ]}
                                }],
                                where: {elements: [
                                    {link: [
                                        {word: "orders"},
                                        {word: "company_id"}
                                    ]},
                                    {operator: "="},
                                    {link: [
                                        {word: "company"},
                                        {word: "id"}
                                    ]},
                                    
                                    {operator: "or"},
                                    
                                    {link: [
                                        {word: "orders"},
                                        {word: "company_id"}
                                    ]},
                                    {operator: "="},
                                    {link: [
                                        {word: "partner"},
                                        {word: "id"}
                                    ]}
                                ]}
                            }
                        },
                        on: {elements: [
                            {boolean: true}
                        ]}
                    }
                ]
            }
        }
    ];
    
    GrapeQLCoach.SystemVariable.tests = [
        {
            str: "{x}",
            result: {name: "x"}
        },
        {
            str: "{X}",
            result: {name: "X"}
        },
        {
            str: "{$Any_Variable}",
            result: {name: "$Any_Variable"}
        },
        {
            str: "{Привет}",
            result: {name: "Привет"}
        },
        {
            str: "{}",
            error: Error
        }
    ];
    
    GrapeQLCoach.ToType.tests = [
        {
            str: "::text",
            result: {
                dataType: {
                    type: "text"
                }
            }
        },
        {
            str: "::  bigint[] ",
            result: {
                dataType: {
                    type: "bigint[]"
                }
            }
        }
    ];
    
    GrapeQLCoach.WithQuery.tests = [
        {
            str: "recursive orders as (select * from company)",
            result: {
                recursive: true,
                name: {word: "orders"},
                select: {
                    columns: [
                        {
                            as: null,
                            expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}
                        }
                    ],
                    from: [{
                        table: {link: [
                            {word: "company"}
                        ]},
                        as: {
                            alias: null
                        }
                    }]
                }
            }
        },
        {
            str: "recursive orders (id, \"name\") as (select * from company)",
            result: {
                recursive: true,
                name: {word: "orders"},
                columns: [
                    {word: "id"},
                    {content: "name"}
                ],
                select: {
                    columns: [
                        {
                            as: null,
                            expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}
                        }
                    ],
                    from: [{
                        table: {link: [
                            {word: "company"}
                        ]},
                        as: {
                            alias: null
                        }
                    }]
                }
            }
        }
    ];

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
    
})(window.QUnit, window.tests.GrapeQLCoach);
