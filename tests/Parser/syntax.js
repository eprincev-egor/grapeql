"use strict";

let tests = {};

tests.Boolean = [
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
    },
    {
        str: "fAlse",
        result: {
            boolean: false
        }
    }
];

tests.CaseWhen = [
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

tests.CaseWhenElement = [
    {
        str: "when true then 1",
        result: {
            when: {elements: [{boolean: true}]},
            then: {elements: [{number: "1"}]}
        }
    }
];

tests.Cast = [
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

tests.Column = [
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
            as: { word: "id"}
        }
    },
    {
        str: "null as nulL1",
        result: {
            expression: {
                elements: [
                    {null: true}
                ]
            },
            as: { word: "nulL1"}
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

tests.Comment = [
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

tests.DataType = [
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
    },
    {
        str: "char",
        err: Error
    }
];

tests.DoubleQuotes = [
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

tests.In = [
    {
        str: "in(1)",
        result: {
            in: [
                {elements: [
                    {number: "1"}
                ]}
            ]
        }
    },
    {
        str: "in ( 1 ,  'nice' )",
        result: {
            in: [
                {elements: [
                    {number: "1"}
                ]},

                {elements: [
                    {content: "nice"}
                ]}
            ]
        }
    },
    {
        str: "in (select id from company)",
        result: {
            in: {
                columns: [
                    {expression: {elements: [
                        {link: [
                            {word: "id"}
                        ]}
                    ]}}
                ],
                from: [
                    {table: {link: [
                        {word: "company"}
                    ]}}
                ]
            }
        }
    }
];

tests.Between = [
    {
        str: "Between 1 and 3",
        result: {
            start: {elements: [
                {number: "1"}
            ]},
            end: {elements: [
                {number: "3"}
            ]}
        }
    }
];

tests.Expression = [
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
                    {word: "Company"},
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
    },
    {
        str: "2::date::text || '120'::char(2) - -8",
        result: {
            elements: [
                {number: "2"},
                {dataType: {type: "date"}},
                {dataType: {type: "text"}},

                {operator: "||"},

                {content: "120"},
                {dataType: {type: "char(2)"}},

                {operator: "-"},

                {operator: "-"},
                {number: "8"}
            ]
        }
    },
    {
        str: "(-1 + 2.1) * '0'::numeric - ( ('-2')::bigint + 8)",
        result: {
            elements: [
                {elements: [
                    {operator: "-"},
                    {number: "1"},
                    {operator: "+"},
                    {number: "2.1"}
                ]},

                {operator: "*"},

                {content: "0"},
                {dataType: {type: "numeric"}},

                {operator: "-"},

                {elements: [
                    {elements: [
                        {content: "-2"}
                    ]},

                    {dataType: {type: "bigint"}},
                    {operator: "+"},
                    {number: "8"}
                ]}
            ]
        }
    },
    {
        str: "company.id in (1, (1+ 1),3)",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {in: [
                    {elements: [
                        {number: "1"}
                    ]},

                    {elements: [
                        {number: "1"},
                        {operator: "+"},
                        {number: "1"}
                    ]},

                    {elements: [
                        {number: "3"}
                    ]}
                ]}
            ]
        }
    },
    {
        str: "company.id between 1 and 2",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"}
                    ]}
                }
            ]
        }
    },
    {
        str: "company.id between 1 and 2 or company.id between 5 and 6",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"}
                    ]}
                },
                {operator: "or"},
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "5"}
                    ]},
                    end: {elements: [
                        {number: "6"}
                    ]}
                }
            ]
        }
    },
    {
        str: "company.id between 1 and 2 > true",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"}
                    ]}
                },
                {operator: ">"},
                {boolean: true}
            ]
        }
    },
    {
        str: "company.id between 1 and 2 >= true",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"}
                    ]}
                },
                {operator: ">="},
                {boolean: true}
            ]
        }
    },
    {
        str: "company.id between 1 and 2 < true",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"}
                    ]}
                },
                {operator: "<"},
                {boolean: true}
            ]
        }
    },
    {
        str: "company.id between 1 and 2 + 3 <= true",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"},
                        {operator: "+"},
                        {number: "3"}
                    ]}
                },
                {operator: "<="},
                {boolean: true}
            ]
        }
    },
    {
        str: "company.id not between 1 and 2 + 3",
        result: {
            elements: [
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]},
                {operator: "not"},
                {
                    start: {elements: [
                        {number: "1"}
                    ]},
                    end: {elements: [
                        {number: "2"},
                        {operator: "+"},
                        {number: "3"}
                    ]}
                }
            ]
        }
    },
    {
        str: "id not in (1,2)",
        result: {
            elements: [
                {link: [
                    {word : "id"}
                ]},
                {operator: "not"},
                {in: [
                    {elements: [
                        {number: "1"}
                    ]},
                    {elements: [
                        {number: "2"}
                    ]}
                ]}
            ]
        }
    },
    {
        str: "test.id between 1 + 3 and 3 + 1 > test.id between ( 8 * test.id ) and 30 - 8",
        result: {
            elements: [
                {link: [
                    {word: "test"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "1"},
                        {operator: "+"},
                        {number: "3"}
                    ]},
                    end: {elements: [
                        {number: "3"},
                        {operator: "+"},
                        {number: "1"}
                    ]}
                },

                {operator: ">"},

                {link: [
                    {word: "test"},
                    {word: "id"}
                ]},
                {
                    start: {elements: [
                        {number: "8"},
                        {operator: "*"},
                        {link: [
                            {word: "test"},
                            {word: "id"}
                        ]}
                    ]},
                    end: {elements: [
                        {number: "30"},
                        {operator: "-"},
                        {number: "8"}
                    ]}
                }
            ]
        }
    },
    {
        str: "(select 1)",
        result: {
            elements: [
                {
                    columns: [
                        {
                            expression: {elements: [
                                {number: "1"}
                            ]}
                        }
                    ]
                }
            ]
        }
    },
    {
        str: "x = (select 1)",
        result: {
            elements: [
                {link: [
                    {word: "x"}
                ]},
                {operator: "="},
                {
                    columns: [
                        {
                            expression: {elements: [
                                {number: "1"}
                            ]}
                        }
                    ]
                }
            ]
        }
    }
];

tests.File = [
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

tests.FromItem = [
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
            as: { word: "Company" },
            table: {link: [
                {word: "public"},
                {word: "company"}
            ]}
        }
    },
    {
        str: "public.company as Company ( id, inn )",
        result: {
            as: { word: "Company" },
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
                    ]}
                }]
            },
            as: { word: "Orders" }
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
                    ]}
                }]
            },
            as: { word: "company" },
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
                word: "some_rows"
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
            as: { word: "orders" }
        }
    },
    {
        str: "./Company.sql as Company",
        result: {
            file: {
                path: [
                    {name: "."},
                    {name: "Company.sql"}
                ]
            },
            as: {
                word: "Company"
            }
        }
    },
    {
        str: "./Company",
        result: {
            file: {
                path: [
                    {name: "."},
                    {name: "Company"}
                ]
            }
        }
    }
];

tests.FunctionCall = [
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

tests.GroupByElement = [
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

tests.Join = [
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
                    {word: "countryId"}
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
                as: { word: "country" }
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
                    word: "sub_company"
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
                as: { word: "company" }
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
                as: { word: "order_id" }
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
                as: { word: "order_id" }
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    }
];

tests.ObjectLink = [
    {
        str: "a.B.c",
        result: {
            link: [
                {word: "a"},
                {word: "B"},
                {word: "c"}
            ]
        }
    },
    {
        str: "a.b.c.d.e.f",
        result: {
            link: [
                {word: "a"},
                {word: "b"},
                {word: "c"},
                {word: "d"},
                {word: "e"},
                {word: "f"}
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
                {word: "X"},
                {word: "y"},
                {content: "some"}
            ]
        }
    }
];

tests.ObjectName = [
    {
        str: "a",
        result: {
            word: "a"
        }
    },
    {
        str: "\"Nice\"",
        result: {
            content: "Nice"
        }
    }
];

tests.Operator = [
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

tests.OrderByElement = [
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

tests.PgNull = [
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

tests.PgNumber = [
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

tests.PgString = [
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

tests.Select = [
    {
        str: "select 1",
        result: {
            columns: [
                {
                    expression: {elements: [
                        {number: "1"}
                    ]}
                }
            ]
        }
    },
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
                ]}
            }]
        }
    },
    {
        str: "select * from \" company\"",
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
                    {content: " company"}
                ]}
            }]
        }
    },
    {
        str: "select company.id as id, null as n from public.company",
        result: {
            columns: [
                {
                    as: { word: "id" },
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]}
                },
                {
                    as: { word: "n" },
                    expression: {elements: [
                        {null: true}
                    ]}
                }
            ],
            from: [{
                table: {link: [
                    {word: "public"},
                    {word: "company"}
                ]}
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
                ]}
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
                ]}
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
                ]}
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
                ]}
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
                ]}
            }],
            fetch: {first: true, count: 5, rows: true}
        }
    },
    {
        str: "select from company fetch next 1 row only",
        result: {
            columns: [],
            from: [{
                table: {link: [
                    {word: "company"}
                ]}
            }],
            fetch: {next: true, count: 1, row: true}
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
                            ]}
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
                ]}
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
                as: { word: "company" },
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
                ]}
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
                        ]}
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
                ]}
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
                    table: {link: [{word: "items_sold"}]}
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
                table: {link: [{word: "company"}]},
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
                            as: { word: "partner" }
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
                            as: { word: "partner_country" }
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
                                        as: { word: "sum_sale" }
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
            }]
        }
    },
    {
        str: "select from company, test.company",
        result: {
            columns: [],
            from: [
                {table: {link: [
                    {word: "company"}
                ]} },
                {table: {link: [
                    {word: "test"},
                    {word: "company"}
                ]} }
            ]
        }
    },
    {
        str: "select from company, company",
        error: Error
    },
    {
        str: "select from test.company, test.company",
        error: Error
    },
    {
        str: "select from test.company as company, test.company",
        error: Error
    },
    {
        str: "select from test.company as company, public.company",
        error: Error
    },
    {
        str: "select from test.company as company, company",
        error: Error
    },
    {
        str: "select from public.company, company",
        error: Error
    },
    {
        str: "select from public.company left join company on true",
        error: Error
    },
    {
        str: "select from a as x left join b as x",
        error: Error
    },
    {
        str: `select *
        from public.Order

        left join ./Company as CompanyClient on
            CompanyClient.id = public.Order.id_company_client`,
        result: {
            columns: [
                {expression: {elements: [
                    {link: [
                        "*"
                    ]}
                ]}}
            ],
            from: [
                {
                    table: {link: [
                        {word: "public"},
                        {word: "Order"}
                    ]},
                    joins: [
                        {
                            type: "left join",
                            from: {
                                file: {path: [
                                    {name: "."},
                                    {name: "Company"}
                                ]},
                                as: { word: "CompanyClient" }
                            },
                            on: {elements: [
                                {link: [
                                    {word: "CompanyClient"},
                                    {word: "id"}
                                ]},
                                {operator: "="},
                                {link: [
                                    {word: "public"},
                                    {word: "Order"},
                                    {word: "id_company_client"}
                                ]}
                            ]}
                        }
                    ]
                }
            ]
        }
    },
    {
        str: "select * from ./Company",
        result: {
            columns: [
                {expression: {elements: [
                    {link: [
                        "*"
                    ]}
                ]}}
            ],
            from: [
                {file: {path: [
                    {name: "."},
                    {name: "Company"}
                ]}}
            ]
        }
    }
];

tests.SystemVariable = [
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

tests.ToType = [
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

tests.WithQuery = [
    {
        str: "recursive orders as (select * from company)",
        result: {
            recursive: true,
            name: {word: "orders"},
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
                    ]}
                }]
            }
        }
    }
];

module.exports = tests;
