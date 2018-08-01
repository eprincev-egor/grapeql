"use strict";

module.exports = [
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
    },
    {
        str: "delete from orders returning *",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            returningAll: true
        }
    },
    {
        str: "delete from orders where true returning *",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            where: {elements: [
                {boolean: true}
            ]},
            returningAll: true
        }
    },
    {
        str: "delete from orders returning id, id_client",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
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
        str: "delete from orders where false returning id, id_client",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            where: {elements: [
                {boolean: false}
            ]},
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
        str: "delete from orders where false returning id|| '1' as id_1, id_client",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
            where: {elements: [
                {boolean: false}
            ]},
            returning: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "id"}
                        ]},
                        {operator: "||"},
                        {content: "1"}
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
        str: "delete from orders * returning *",
        result: {
            star: true,
            table: {link: [
                {word: "orders"}
            ]},
            returningAll: true
        }
    },
    {
        str: `delete from orders
        using companies returning *
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
            
            returningAll: true
        }
    },
    {
        str: "delete from only orders * as Order returning *",
        result: {
            star: true,
            only: true,
            table: {link: [
                {word: "orders"}
            ]},
            as: {word: "Order"},
            returningAll: true
        }
    },
    {
        str: "delete from only orders * as Order returning *, id",
        result: {
            star: true,
            only: true,
            table: {link: [
                {word: "orders"}
            ]},
            as: {word: "Order"},
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
                ]}}
            ]
        }
    },
    {
        str: "delete from only orders * as Order returning 1",
        result: {
            star: true,
            only: true,
            table: {link: [
                {word: "orders"}
            ]},
            as: {word: "Order"},
            returning: [
                {expression: {elements: [
                    {number: "1"}
                ]}}
            ]
        }
    },
    {
        // $ is reserved symbol for alias
        str: "delete from orders as \"$orders\"",
        error: Error
    },
    {
        // $ is reserved symbol for alias
        str: "delete from orders returning 1 as \"$\"",
        error: Error
    },
    {
        // $ is reserved symbol for alias
        str: "delete from orders returning orders.\"$some\"",
        error: Error
    },
    {
        str: "delete from orders returning 1 as \"x$\"",
        result: {
            table: {link: [
                {word: "orders"}
            ]},
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
        str: "delete row from orders",
        error: Error
    },
    {
        str: "delete row from orders",
        options: {
            allowReturningObject: true
        },
        result: {
            returningObject: true,
            table: {link: [
                {word: "orders"}
            ]}
        }
    },
    {
        str: "delete from orders",
        options: {
            allowReturningObject: true
        },
        result: {
            table: {link: [
                {word: "orders"}
            ]}
        }
    }
];
