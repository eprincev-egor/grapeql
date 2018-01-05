"use strict";

module.exports = [
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