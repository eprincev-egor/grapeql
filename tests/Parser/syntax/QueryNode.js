"use strict";

module.exports = [
    {
        str: `declare
            $order_id bigint not null;
        select *
        from orders
        where
            orders.id = $order_id
        `,
        result: {
            declare: {
                variables: {
                    order_id: {
                        name: {name: "order_id"},
                        type: {type: "bigint"},
                        notNull: true
                    }
                },
                variablesArr: [
                    {
                        name: {name: "order_id"},
                        type: {type: "bigint"},
                        notNull: true
                    }
                ]
            },
            select: {
                columns: [
                    {
                        expression: {elements: [
                            {link: ["*"]}
                        ]}
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
                        {word: "id"}
                    ]},
                    {operator: "="},
                    {name: "order_id"}
                ]}
            }
        }
    }
];
