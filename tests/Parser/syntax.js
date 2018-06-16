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
    },
    {
        str: "is true",
        result: {
            elements: [
                {operator: "is"},
                {boolean: true}
            ]
        }
    },
    {
        str: "is not true",
        result: {
            elements: [
                {operator: "is not"},
                {boolean: true}
            ]
        }
    },
    {
        str: "is false",
        result: {
            elements: [
                {operator: "is"},
                {boolean: false}
            ]
        }
    },
    {
        str: "is not false",
        result: {
            elements: [
                {operator: "is not"},
                {boolean: false}
            ]
        }
    },
    {
        str: "'abc' ~ 'abc'",
        result: {
            elements: [
                {content: "abc"},
                {operator: "~"},
                {content: "abc"}
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
    },
    {
        str: "./Country)",
        result: {
            path: [
                {name: "."},
                {name: "Country"}
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
    },
    {
        str: "isnull some",
        result: {operator: "isnull"}
    },
    {
        str: "notnull some",
        result: {operator: "notnull"}
    },
    {
        str: "is not distinct from",
        result: {operator: "is not distinct from"}
    },
    {
        str: "is unknown",
        result: {operator: "is unknown"}
    },
    {
        str: "is not  unknown",
        result: {operator: "is not unknown"}
    },
    {
        str: "sImilar  To",
        result: {operator: "similar to"}
    },
    {
        str: "iLike",
        result: {operator: "ilike"}
    },
    {
        str: "likE",
        result: {operator: "like"}
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
        str: "'hello' \n\r 'world' \n\r 'world'  ",
        result: {content: "helloworldworld"}
    },
    {
        str: "'hello' \n\r 'world' \n\r 'world' \n ",
        result: {content: "helloworldworld"}
    },
    {
        str: "'hello' \n\r 'world' \n\r 'world' \r ",
        result: {content: "helloworldworld"}
    },
    {
        str: "'hello' \n\r 'world' \n\r 'world' \n\r ",
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
            with: {
                queries: {
                    orders: {
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
                },
                queriesArr: [
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
                ]
            },
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
        str: `with recursive
        	x as (select 1),
        	y as (select 2)
        select *
        from x, y`,
        result: {
            with: {
                recursive: true,
                queries: {
                    x: {
                        name: {word: "x"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "1"}
                                    ]}
                                }
                            ]
                        }
                    },
                    y: {
                        name: {word: "y"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "2"}
                                    ]}
                                }
                            ]
                        }
                    }
                },
                queriesArr: [
                    {
                        name: {word: "x"},
                        select: {
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
                        name: {word: "y"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "2"}
                                    ]}
                                }
                            ]
                        }
                    }
                ]
            },
            columns: [
                {
                    expression: {elements: [
                        {link: ["*"]}
                    ]}
                }
            ],
            from: [
                {table: {link: [
                    {word: "x"}
                ]}},
                {table: {link: [
                    {word: "y"}
                ]}}
            ]
        }
    },
    {
        str: `with recursive
        	x as (select 1),
        	y as (select 2)
        select ( select count(*) from x )`,
        result: {
            with: {
                recursive: true,
                queries: {
                    x: {
                        name: {word: "x"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "1"}
                                    ]}
                                }
                            ]
                        }
                    },
                    y: {
                        name: {word: "y"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "2"}
                                    ]}
                                }
                            ]
                        }
                    }
                },
                queriesArr: [
                    {
                        name: {word: "x"},
                        select: {
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
                        name: {word: "y"},
                        select: {
                            columns: [
                                {
                                    expression: {elements: [
                                        {number: "2"}
                                    ]}
                                }
                            ]
                        }
                    }
                ]
            },
            columns: [
                {
                    expression: {elements: [
                        {
                            columns: [
                                {
                                    expression: {elements: [
                                        {
                                            "function": {link: [
                                                {word: "count"}
                                            ]},
                                            "arguments": [],
                                            isStar: true
                                        }
                                    ]}
                                }
                            ],
                            from: [
                                {table: {link: [
                                    {word: "x"}
                                ]}}
                            ]
                        }
                    ]}
                }
            ]
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
    },
    {
        str: "select count(*) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "count"}
                        ]},
                        "arguments": [],
                        isStar: true
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select count( * ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "count"}
                        ]},
                        "arguments": [],
                        isStar: true
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select string_agg( name order by id desc ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "string_agg"}
                        ]},
                        "arguments": [{elements: [
                            {link: [
                                {word: "name"}
                            ]}
                        ]}],
                        orderBy: [
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
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select string_agg( distinct name ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "string_agg"}
                        ]},
                        "arguments": [{elements: [
                            {link: [
                                {word: "name"}
                            ]}
                        ]}],
                        distinct: true
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select string_agg( all name ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "string_agg"}
                        ]},
                        "arguments": [{elements: [
                            {link: [
                                {word: "name"}
                            ]}
                        ]}],
                        all: true
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select string_agg( name order by id desc ) filter ( where name ilike 'x%' ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "string_agg"}
                        ]},
                        "arguments": [{elements: [
                            {link: [
                                {word: "name"}
                            ]}
                        ]}],
                        orderBy: [
                            {
                                expression: {elements: [
                                    {link: [
                                        {word: "id"}
                                    ]}
                                ]},
                                vector: "desc"
                            }
                        ],
                        where: {elements: [
                            {link: [
                                {word: "name"}
                            ]},
                            {operator: "ilike"},
                            {content: "x%"}
                        ]}
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: "select string_agg( name ) within group ( order by id desc ) filter ( where name ilike 'x%' ) from company",
        result: {
            columns: [
                {expression: {elements: [
                    {
                        "function": {link: [
                            {word: "string_agg"}
                        ]},
                        "arguments": [{elements: [
                            {link: [
                                {word: "name"}
                            ]}
                        ]}],
                        within: [
                            {
                                expression: {elements: [
                                    {link: [
                                        {word: "id"}
                                    ]}
                                ]},
                                vector: "desc"
                            }
                        ],
                        where: {elements: [
                            {link: [
                                {word: "name"}
                            ]},
                            {operator: "ilike"},
                            {content: "x%"}
                        ]}
                    }
                ]}}
            ],
            from: [
                {table: {link: [
                    {word: "company"}
                ]}}
            ]
        }
    },
    {
        str: `select
        	code,
        	row_number() over(test_x) as index_x,
        	row_number() over(test_y) as index_y
        from country

        where
            country.name is not null

        window
        	test_x as (partition by country.id % 3 = 0),
        	test_y as (partition by country.id % 4 = 0)
        `,
        result: {
            columns: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "code"}
                        ]}
                    ]}
                },
                {
                    expression: {elements: [
                        {
                            "function": {link: [
                                {word: "row_number"}
                            ]},
                            "arguments": [],
                            over: {
                                windowDefinition: {word: "test_x"}
                            }
                        }
                    ]},
                    as: {word: "index_x"}
                },
                {
                    expression: {elements: [
                        {
                            "function": {link: [
                                {word: "row_number"}
                            ]},
                            "arguments": [],
                            over: {
                                windowDefinition: {word: "test_y"}
                            }
                        }
                    ]},
                    as: {word: "index_y"}
                }
            ],
            from: [
                {table: {link: [
                    {word: "country"}
                ]}}
            ],
            window: [
                {
                    as: {word: "test_x"},
                    body: {
                        partitionBy: [
                            {elements: [
                                {link: [
                                    {word: "country"},
                                    {word: "id"}
                                ]},
                                {operator: "%"},
                                {number: "3"},
                                {operator: "="},
                                {number: "0"}
                            ]}
                        ]
                    }
                },
                {
                    as: {word: "test_y"},
                    body: {
                        partitionBy: [
                            {elements: [
                                {link: [
                                    {word: "country"},
                                    {word: "id"}
                                ]},
                                {operator: "%"},
                                {number: "4"},
                                {operator: "="},
                                {number: "0"}
                            ]}
                        ]
                    }
                }
            ],

            where: {elements: [
                {link: [
                    {word: "country"},
                    {word: "name"}
                ]},
                {operator: "is not"},
                {null: true}
            ]}
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
        str: "orders as (select * from company)",
        result: {
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
        str: "orders (id, \"name\") as (select * from company)",
        result: {
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

tests.CacheReverseExpression = [
    {
        str: "after change public.order set where public.order.id_order = company.id",
        result: {
            table: {link: [
                {word: "public"},
                {word: "order"}
            ]},
            expression: {elements: [
                {link: [
                    {word: "public"},
                    {word: "order"},
                    {word: "id_order"}
                ]},
                {operator: "="},
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]}
            ]}
        }
    }
];

tests.CacheFor = [
    {
        str: `cache totals for public.order as orders (
            select 1
        )`,
        result: {
            name: {word: "totals"},
            table: {link: [
                {word: "public"},
                {word: "order"}
            ]},
            as: {word: "orders"},
            select: {
                columns: [{
                    expression: {elements: [
                        {number: "1"}
                    ]}
                }]
            }
        }
    },
    {
        str: `cache order_totals for company (
            select
                count(orders.id) as quantity
            from orders
            where
                orders.id_client = company.id
        )

        after change orders set where
            orders.id_client = company.id`,
        result: {
            name: {word: "order_totals"},
            table: {link: [
                {word: "company"}
            ]},

            select: {
                columns: [
                    {
                        expression: {elements: [
                            {
                                "function": {link: [
                                    {word: "count"}
                                ]},
                                "arguments": [
                                    {
                                        elements: [
                                            {link: [
                                                {word: "orders"},
                                                {word: "id"}
                                            ]}
                                        ]
                                    }
                                ]
                            }
                        ]},
                        as: {word: "quantity"}
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
                        {word: "id_client"}
                    ]},
                    {operator: "="},
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            },

            reverse: [
                {
                    table: {link: [
                        {word: "orders"}
                    ]},
                    expression: {elements: [
                        {link: [
                            {word: "orders"},
                            {word: "id_client"}
                        ]},
                        {operator: "="},
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]}
                }
            ]
        }
    },

    {
        str: `cache totals for company (
            select
                count(orders.id) as quantity,
                string_agg(partner.name, ', ') as partners_names
            from orders

            left join company as partner on
                partner.id = orders.id_partner

            where
                orders.id_client = company.id
        )

        after change orders set where
            orders.id_client = company.id

        after change company as partner set where
            company.id in (
                select id_client
                from orders
                where
                    orders.id_partner = partner.id
            )
        `,
        result: {
            name: {word: "totals"},
            table: {link: [
                {word: "company"}
            ]},

            select: {
                columns: [
                    {
                        expression: {elements: [
                            {
                                "function": {link: [
                                    {word: "count"}
                                ]},
                                "arguments": [
                                    {
                                        elements: [
                                            {link: [
                                                {word: "orders"},
                                                {word: "id"}
                                            ]}
                                        ]
                                    }
                                ]
                            }
                        ]},
                        as: {word: "quantity"}
                    },
                    {
                        expression: {elements: [
                            {
                                "function": {link: [
                                    {word: "string_agg"}
                                ]},
                                "arguments": [
                                    {
                                        elements: [
                                            {link: [
                                                {word: "partner"},
                                                {word: "name"}
                                            ]}
                                        ]
                                    },
                                    {
                                        elements: [
                                            {content: ", "}
                                        ]
                                    }
                                ]
                            }
                        ]},
                        as: {word: "partners_names"}
                    }
                ],
                from: [{
                    table: {link: [
                        {word: "orders"}
                    ]},
                    joins: [{
                        type: "left join",
                        from: {
                            table: {link: [
                                {word: "company"}
                            ]},
                            as: {word: "partner"}
                        },
                        on: {elements: [
                            {link: [
                                {word: "partner"},
                                {word: "id"}
                            ]},
                            {operator: "="},
                            {link: [
                                {word: "orders"},
                                {word: "id_partner"}
                            ]}
                        ]}
                    }]
                }],
                where: {elements: [
                    {link: [
                        {word: "orders"},
                        {word: "id_client"}
                    ]},
                    {operator: "="},
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            },

            reverse: [
                {
                    table: {link: [
                        {word: "orders"}
                    ]},
                    expression: {elements: [
                        {link: [
                            {word: "orders"},
                            {word: "id_client"}
                        ]},
                        {operator: "="},
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]}
                },
                {
                    table: {link: [
                        {word: "company"}
                    ]},
                    as: {word: "partner"},
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]},
                        {in: {
                            columns: [{
                                expression: {elements: [
                                    {link: [
                                        {word: "id_client"}
                                    ]}
                                ]}
                            }],
                            from: [{
                                table: {link: [
                                    {word: "orders"}
                                ]}
                            }],

                            where: {elements: [
                                {link: [
                                    {word: "orders"},
                                    {word: "id_partner"}
                                ]},
                                {operator: "="},
                                {link: [
                                    {word: "partner"},
                                    {word: "id"}
                                ]}
                            ]}
                        }}
                    ]}
                }
            ]
        }
    }
];

tests.WindowDefinition = [
    {
        str: "parent_window",
        result: {
            windowDefinition: {
                word: "parent_window"
            }
        }
    },
    {
        str: "partition by company.name, company.id",
        result: {
            partitionBy: [
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "name"}
                    ]}
                ]},
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            ]
        }
    },
    {
        str: "order by company.name asc, company.id desc",
        result: {
            orderBy: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "name"}
                        ]}
                    ]},
                    vector: "asc"
                },
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]},
                    vector: "desc"
                }
            ]
        }
    },
    {
        str: "range 1 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range 1 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                }
            }
        }
    },
    {
        str: "range between 1 preceding and 2 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between 1 preceding and 2 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "range between 1 following and 2 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between 1 following and 2 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "range unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range current row",
        result: {
            range: {
                start: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "range between unbounded preceding and unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between unbounded preceding and unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between current row and unbounded following",
        result: {
            range: {
                start: {
                    currentRow: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and current row",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "rows 1 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows 1 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows between 1 preceding and 2 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between 1 preceding and 2 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows between 1 following and 2 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between 1 following and 2 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows current row",
        result: {
            rows: {
                start: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "rows between unbounded preceding and unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between unbounded preceding and unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between current row and unbounded following",
        result: {
            rows: {
                start: {
                    currentRow: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and current row",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "parent_window partition by company.name, company.id order by company.name desc, company.id asc rows between current row and 100 following",
        result: {
            windowDefinition: {word: "parent_window"},
            partitionBy: [
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "name"}
                    ]}
                ]},
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            ],
            orderBy: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "name"}
                        ]}
                    ]},
                    vector: "desc"
                },
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]},
                    vector: "asc"
                }
            ],
            rows: {
                start: {
                    currentRow: true
                },
                end: {
                    value: {number: "100"},
                    following: true
                }
            }
        }
    }
];

tests.With = [
    {
        str: "with X as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with \"X\" as (select 1)",
        result: {
            queries: {
                X: {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with x as (select 1), y as (select 2)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    select: {
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
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with y as (select 2), x as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                },
                {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },

    {
        str: "with x as (select 2), x as (select 1)",
        error: Error
    }
];

tests.Delete = [
    {
        str: "delete from orders",
        result: {
            table: {link: [
                {word: "orders"}
            ]}
        }
    },
    {
        str: "delete from only orders",
        result: {
            only: true,
            table: {link: [
                {word: "orders"}
            ]}
        }
    },
    {
        str: "delete from orders *",
        result: {
            star: true,
            table: {link: [
                {word: "orders"}
            ]}
        }
    },
    {
        str: "delete from only orders *",
        result: {
            star: true,
            only: true,
            table: {link: [
                {word: "orders"}
            ]}
        }
    },
    {
        str: "delete from only orders * as Order",
        result: {
            star: true,
            only: true,
            table: {link: [
                {word: "orders"}
            ]},
            as: {word: "Order"}
        }
    },
    {
        str: `delete from orders
        using companies
        where
            orders.id_client = companies.id and
            companies.name ilike '%ooo%'
        `,
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            using: [{
                table: {link: [
                    {word: "companies"}
                ]}
            }],
            where: {elements: [
                {link: [
                    {word: "orders"},
                    {word: "id_client"}
                ]},
                {operator: "="},
                {link: [
                    {word: "companies"},
                    {word: "id"}
                ]},

                {operator: "and"},

                {link: [
                    {word: "companies"},
                    {word: "name"}
                ]},
                {operator: "ilike"},
                {content: "%ooo%"}
            ]}
        }
    },
    {
        str: `with
            some_orders as (select * from orders)

            delete from companies
            where
                companies.id in (select id_client from some_orders)
        `,
        result: {
            with: {
                queries: {
                    some_orders: {
                        name: {word: "some_orders"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {link: [
                                        "*"
                                    ]}
                                ]}
                            }],
                            from: [{
                                table: {link: [
                                    {word: "orders"}
                                ]}
                            }]
                        }
                    }
                },
                queriesArr: [
                    {
                        name: {word: "some_orders"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {link: [
                                        "*"
                                    ]}
                                ]}
                            }],
                            from: [{
                                table: {link: [
                                    {word: "orders"}
                                ]}
                            }]
                        }
                    }
                ]
            },
            table: {link: [
                {word: "companies"}
            ]},
            where: {elements: [
                {link: [
                    {word: "companies"},
                    {word: "id"}
                ]},
                {in: {
                    columns: [{
                        expression: {elements: [
                            {link: [
                                {word: "id_client"}
                            ]}
                        ]}
                    }],
                    from: [{
                        table: {link: [
                            {word: "some_orders"}
                        ]}
                    }]
                }}
            ]}
        }
    }
];

tests.ValueItem = [
    {
        str: "default",
        result: {
            default: true
        }
    },
    {
        str: "1.1",
        result: {
            expression: {elements: [
                {number: "1.1"}
            ]}
        }
    }
];

tests.ValuesRow = [
    {
        str: "(default)",
        result: {
            items: [{default: true}]
        }
    }
];

tests.Insert = [
    {
        str: "insert into orders default values",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true
        }
    },
    {
        str: "insert into orders as Order default values",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            as: {word: "Order"},
            defaultValues: true
        }
    },
    {
        str: "insert into orders values (1,2), (3, 4)",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {number: "2"}
                    ]}}
                ]},
                {items: [
                    {expression: {elements: [
                        {number: "3"}
                    ]}},
                    {expression: {elements: [
                        {number: "4"}
                    ]}}
                ]}
            ]
        }
    },
    {
        str: "insert into orders (id_country) values (default)",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            columns: [
                {word: "id_country"}
            ],
            values: [
                {items: [
                    {default: true}
                ]}
            ]
        }
    },
    {
        str: "insert into orders select 1",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            select: {
                columns: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}}
                ]
            }
        }
    },
    {
        str: "with x1 as (select 2) insert into orders select * from x1",
        result: {
            with: {
                queries: {
                    x1: {
                        name: {word: "x1"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }]
                        }
                    }
                },
                queriesArr: [
                    {
                        name: {word: "x1"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }]
                        }
                    }
                ]
            },
            table: {link: [
                {word: "orders"}
            ]},
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
                        {word: "x1"}
                    ]}
                }]
            }
        }
    }
];

module.exports = tests;
