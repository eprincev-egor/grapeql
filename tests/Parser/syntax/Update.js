"use strict";

module.exports = [
    {
        str: "update companies set name = 'nice'",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update only companies set name = 'nice'",
        result: {
            only: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update companies * set name = 'nice'",
        result: {
            star: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update only companies * set name = 'nice'",
        result: {
            only: true,
            star: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update companies set name = 'nice', note = 'hello'",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                },
                {
                    column: {word: "note"},
                    value: {expression: {elements: [
                        {content: "hello"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update companies set name = 'nice', (x, y) = ('hello', 'world')",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                },
                {
                    columns: [
                        {word: "x"},
                        {word: "y"}
                    ],
                    values: [
                        {expression: {elements: [
                            {content: "hello"}
                        ]}},
                        {expression: {elements: [
                            {content: "world"}
                        ]}}
                    ]
                }
            ]
        }
    },
    {
        str: `update
        only companies * set
            name = 'nice',
            (x, y) = ('hello', 'world'),
            (inn, kpp) = (
                select v1, v2
                from requisites
                limit 1
            )
        `,
        result: {
            only: true,
            star: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                },
                {
                    columns: [
                        {word: "x"},
                        {word: "y"}
                    ],
                    values: [
                        {expression: {elements: [
                            {content: "hello"}
                        ]}},
                        {expression: {elements: [
                            {content: "world"}
                        ]}}
                    ]
                },
                {
                    columns: [
                        {word: "inn"},
                        {word: "kpp"}
                    ],
                    select: {
                        columns: [
                            {expression: {elements: [
                                {link: [
                                    {word: "v1"}
                                ]}
                            ]}},
                            {expression: {elements: [
                                {link: [
                                    {word: "v2"}
                                ]}
                            ]}}
                        ],
                        from: [{
                            table: {link: [
                                {word: "requisites"}
                            ]}
                        }],
                        limit: 1
                    }
                }
            ]
        }
    },
    {
        str: `update companies set
            name = 'nice'
        where
            companies.id > 100
        `,
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ],
            where: {elements: [
                {link: [
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: ">"},
                {number: "100"}
            ]}
        }
    },
    {
        str: `update public.companies as companies set
            name = 'nice'
        where
            companies.id > 100
        `,
        result: {
            table: {link: [
                {word: "public"},
                {word: "companies"}
            ]},
            as: {word: "companies"},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ],
            where: {elements: [
                {link: [
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: ">"},
                {number: "100"}
            ]}
        }
    },
    {
        str: `update
        only companies * set
            name = 'nice',
            (x, y) = ('hello', 'world'),
            (inn, kpp) = (
                select v1, v2
                from requisites
                limit 1
            )
        where
            companies.id > 100
        `,
        result: {
            only: true,
            star: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                },
                {
                    columns: [
                        {word: "x"},
                        {word: "y"}
                    ],
                    values: [
                        {expression: {elements: [
                            {content: "hello"}
                        ]}},
                        {expression: {elements: [
                            {content: "world"}
                        ]}}
                    ]
                },
                {
                    columns: [
                        {word: "inn"},
                        {word: "kpp"}
                    ],
                    select: {
                        columns: [
                            {expression: {elements: [
                                {link: [
                                    {word: "v1"}
                                ]}
                            ]}},
                            {expression: {elements: [
                                {link: [
                                    {word: "v2"}
                                ]}
                            ]}}
                        ],
                        from: [{
                            table: {link: [
                                {word: "requisites"}
                            ]}
                        }],
                        limit: 1
                    }
                }
            ],
            where: {elements: [
                {link: [
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: ">"},
                {number: "100"}
            ]}
        }
    },
    {
        str: `update companies set
            name = 'nice'
        from orders
        where
            orders.id_client = companies.id and
            orders.need_update
        `,
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
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
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: "and"},
                {link: [
                    {word: "orders"},
                    {word: "need_update"}
                ]}
            ]}
        }
    },
    {
        str: `with x1 as (select 1 as id)
        update companies set
            name = 'nice'
        from orders
        where
            orders.id_client = companies.id and
            orders.need_update and
            orders.id_country = (select id from x1)
        `,
        result: {
            with: {
                queries: {
                    x1: {
                        name: {word: "x1"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
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
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
                            }]
                        }
                    }
                ]
            },
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
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
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: "and"},
                {link: [
                    {word: "orders"},
                    {word: "need_update"}
                ]},
                {operator: "and"},
                {link: [
                    {word: "orders"},
                    {word: "id_country"}
                ]},
                {operator: "="},
                {
                    columns: [
                        {expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]}}
                    ],
                    from: [{
                        table: {link: [
                            {word: "x1"}
                        ]}
                    }]
                }
            ]}
        }
    },
    {
        str: "update companies set name = 'nice' returning *",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ],
            returningAll: true
        }
    },
    {
        str: "update companies set name = 'nice' returning id, id_client",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ],
            returning: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "id"}
                        ]}
                    ]}
                },
                {expression: {elements: [
                    {link: [
                        {word: "id_client"}
                    ]}
                ]}}
            ]
        }
    },
    {
        str: "update companies set name = 'nice' returning *, id",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ],
            returning: [
                {
                    expression: {elements: [
                        {link: [
                            "*"
                        ]}
                    ]}
                },
                {expression: {elements: [
                    {link: [
                        {word: "id"}
                    ]}
                ]}}
            ]
        }
    },
    {
        str: `with x1 as (select 1 as id)
        update companies set
            name = 'nice'
        from orders
        where
            orders.id_client = companies.id and
            orders.need_update and
            orders.id_country = (select id from x1)
        returning *
        `,
        result: {
            with: {
                queries: {
                    x1: {
                        name: {word: "x1"},
                        select: {
                            columns: [{
                                expression: {elements: [
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
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
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
                            }]
                        }
                    }
                ]
            },
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
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
                    {word: "companies"},
                    {word: "id"}
                ]},
                {operator: "and"},
                {link: [
                    {word: "orders"},
                    {word: "need_update"}
                ]},
                {operator: "and"},
                {link: [
                    {word: "orders"},
                    {word: "id_country"}
                ]},
                {operator: "="},
                {
                    columns: [
                        {expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]}}
                    ],
                    from: [{
                        table: {link: [
                            {word: "x1"}
                        ]}
                    }]
                }
            ]},
            returningAll: true
        }
    },
    {
        str: "update row companies set name = 'nice'",
        error: Error
    },
    {
        str: "update row companies set name = 'nice'",
        options: {
            allowReturningObject: true
        },
        result: {
            returningObject: true,
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    },
    {
        str: "update companies set name = 'nice'",
        options: {
            allowReturningObject: true
        },
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            set: [
                {
                    column: {word: "name"},
                    value: {expression: {elements: [
                        {content: "nice"}
                    ]}}
                }
            ]
        }
    }
];
