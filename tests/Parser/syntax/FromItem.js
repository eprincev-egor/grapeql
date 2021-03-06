"use strict";

module.exports = [
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
