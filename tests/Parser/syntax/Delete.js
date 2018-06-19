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
    }
];
