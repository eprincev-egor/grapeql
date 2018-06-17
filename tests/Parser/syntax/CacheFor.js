"use strict";

module.exports = [
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
