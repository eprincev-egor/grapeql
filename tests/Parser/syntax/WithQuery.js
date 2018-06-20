"use strict";

module.exports = [
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
    },
    {
        str: "x as (values (1), (2, 3))",
        // VALUES lists must all be the same length
        error: Error
    },
    {
        str: "x as (values (default))",
        // DEFAULT is not allowed in this context
        error: Error
    }
];
