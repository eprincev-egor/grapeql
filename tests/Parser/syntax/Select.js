"use strict";

module.exports = [
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
    },
    {
        str: `with
            x1 as (
                values
                    (1, 2)
            )
        select *
        from x1`,
        result: {
            with: {
                queries: {
                    x1: {
                        name: {word: "x1"},
                        values: [
                            {items: [
                                {expression: {elements: [
                                    {number: "1"}
                                ]}},
                                {expression: {elements: [
                                    {number: "2"}
                                ]}}
                            ]}
                        ]
                    }
                },
                queriesArr: [
                    {
                        name: {word: "x1"},
                        values: [
                            {items: [
                                {expression: {elements: [
                                    {number: "1"}
                                ]}},
                                {expression: {elements: [
                                    {number: "2"}
                                ]}}
                            ]}
                        ]
                    }
                ]
            },
            columns: [{
                expression: {elements: [
                    {link: ["*"]}
                ]}
            }],
            from: [{
                table: {link: [
                    {word: "x1"}
                ]}
            }]
        }
    },
    {
        str: "select row * from company",
        error: Error
    },
    {
        str: "select row * from company",
        options: {allowCustomReturning: true},
        result: {
            returningObject: true,
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
        str: "select value id from company",
        options: {allowCustomReturning: true},
        result: {
            returningValue: true,
            columns: [
                {
                    as: null,
                    expression: {elements: [
                        {link: [
                            {word: "id"}
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
        str: "select * from company",
        options: {allowCustomReturning: true},
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
    }
];
