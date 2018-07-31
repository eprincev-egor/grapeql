"use strict";

module.exports = [
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
    },
    {
        str: "insert into companies (id, name) values (1, 'Test') on conflict (id) do nothing",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "id"},
                {word: "name"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {content: "Test"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "id"}}
                ],
                doNothing: true
            }
        }
    },
    {
        str: "insert into companies (id, name) values (1, 'Test') on conflict (id) where id > 0 do nothing",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "id"},
                {word: "name"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {content: "Test"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "id"}}
                ],
                where: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: ">"},
                    {number: "0"}
                ]},
                doNothing: true
            }
        }
    },
    {
        str: "insert into companies (id, name) values (1, 'Test') on conflict on constraint some_constraint_name where id > 0 do nothing",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "id"},
                {word: "name"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {content: "Test"}
                    ]}}
                ]}
            ],
            onConflict: {
                constraint: {word: "some_constraint_name"},
                where: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: ">"},
                    {number: "0"}
                ]},
                doNothing: true
            }
        }
    },
    {
        str: `insert into companies
        (name, inn)
        values ('ooo', '1234')
        on conflict (inn)
        do update set
            name = excluded.name
        `,
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "name"},
                {word: "inn"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {content: "ooo"}
                    ]}},
                    {expression: {elements: [
                        {content: "1234"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "inn"}}
                ],
                updateSet: [
                    {
                        column: {word: "name"},
                        value: {expression: {elements: [
                            {link: [
                                {word: "excluded"},
                                {word: "name"}
                            ]}
                        ]}}
                    }
                ]
            }
        }
    },
    {
        str: `insert into companies
        (name, inn)
        values ('ooo', '1234')
        on conflict (inn)
        do update set
            name = excluded.name
        where name <> 'x'
        `,
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "name"},
                {word: "inn"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {content: "ooo"}
                    ]}},
                    {expression: {elements: [
                        {content: "1234"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "inn"}}
                ],
                updateSet: [
                    {
                        column: {word: "name"},
                        value: {expression: {elements: [
                            {link: [
                                {word: "excluded"},
                                {word: "name"}
                            ]}
                        ]}}
                    }
                ],
                updateWhere: {elements: [
                    {link: [
                        {word: "name"}
                    ]},
                    {operator: "<>"},
                    {content: "x"}
                ]}
            }
        }
    },
    {
        str: "insert into orders default values returning *",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true,
            returningAll: true
        }
    },
    {
        str: "insert into orders default values returning id, id_client",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true,
            returning: [
                {expression: {elements: [
                    {link: [
                        {word: "id"}
                    ]}
                ]}},
                {expression: {elements: [
                    {link: [
                        {word: "id_client"}
                    ]}
                ]}}
            ]
        }
    },
    {
        str: "insert into orders default values returning *, id, id_client",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true,
            returning: [
                {expression: {elements: [
                    {link: [
                        "*"
                    ]}
                ]}},
                {expression: {elements: [
                    {link: [
                        {word: "id"}
                    ]}
                ]}},
                {expression: {elements: [
                    {link: [
                        {word: "id_client"}
                    ]}
                ]}}
            ]
        }
    },
    {
        str: "insert into orders default values returning 1",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true,
            returning: [
                {expression: {elements: [
                    {number: "1"}
                ]}}
            ]
        }
    },
    {
        str: "insert into companies (id, name) values (1, 'Test') on conflict (id) where id > 0 do nothing returning *",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "id"},
                {word: "name"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {content: "Test"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "id"}}
                ],
                where: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: ">"},
                    {number: "0"}
                ]},
                doNothing: true
            },
            returningAll: true
        }
    },
    {
        str: "insert into companies (id, name) values (1, 'Test') on conflict (id) where id > 0 do nothing returning id+ 1 as id_1, id_client",
        result: {
            table: {link: [
                {word: "companies"}
            ]},
            columns: [
                {word: "id"},
                {word: "name"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {number: "1"}
                    ]}},
                    {expression: {elements: [
                        {content: "Test"}
                    ]}}
                ]}
            ],
            onConflict: {
                target: [
                    {column: {word: "id"}}
                ],
                where: {elements: [
                    {link: [
                        {word: "id"}
                    ]},
                    {operator: ">"},
                    {number: "0"}
                ]},
                doNothing: true
            },
            returning: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "id"}
                        ]},
                        {operator: "+"},
                        {number: "1"}
                    ]},
                    as: {word: "id_1"}
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
        str: "insert into orders values (1,2), (3, 4) returning *",
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
            ],
            returningAll: true
        }
    },
    {
        str: "with x1 as (select 2) insert into orders select * from x1 returning *",
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
            },
            returningAll: true
        }
    },
    {
        // $ is reserved symbol for returning alias
        str: "insert into orders returning 1 as \"$\"",
        error: Error
    },
    {
        // $ is reserved symbol for returning alias
        str: "insert into orders returning orders.\"$some\"",
        error: Error
    },
    {
        str: "insert into orders default values returning 1 as \"x$\"",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true,
            returning: [
                {
                    expression: {elements: [
                        {number: "1"}
                    ]},
                    as: {content: "x$"}
                }
            ]
        }
    },

    {
        str: "insert into orders values (1), (2, 3)",
        // VALUES lists must all be the same length
        error: Error
    },
    {
        str: "insert row into orders default values",
        error: Error
    },
    {
        str: "insert row into orders default values",
        options: {
            allowReturningObject: true
        },
        result: {
            returningObject: true,
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true
        }
    },
    {
        str: "insert into orders default values",
        options: {
            allowReturningObject: true
        },
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            defaultValues: true
        }
    },
    {
        str: "insert into company (some_date, some_timestamp) values ('2017-12-31T21:00:00.000Z'::date, '2017-12-31T21:00:00.000Z'::timestamp without time zone)",
        result: {
            table: {link: [
                {word: "company"}
            ]},
            columns: [
                {word: "some_date"},
                {word: "some_timestamp"}
            ],
            values: [
                {items: [
                    {expression: {elements: [
                        {content: "2017-12-31T21:00:00.000Z"},
                        {dataType: {
                            type: "date"
                        }}
                    ]}},
                    {expression: {elements: [
                        {content: "2017-12-31T21:00:00.000Z"},
                        {dataType: {
                            type: "timestamp without time zone"
                        }}
                    ]}}
                ]}
            ]
        }
    }
];
