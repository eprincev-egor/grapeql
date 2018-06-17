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
    }
];
