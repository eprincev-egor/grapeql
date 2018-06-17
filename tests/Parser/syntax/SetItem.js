"use strict";

module.exports = [
    {
        str: "x=1",
        result: {
            column: {word: "x"},
            value: {expression: {elements: [
                {number: "1"}
            ]}}
        }
    },
    {
        str: "\"X\" = default",
        result: {
            column: {content: "X"},
            value: {default: true}
        }
    },
    {
        str: "(x,y,z) = (1,default,3)",
        result: {
            columns: [
                {word: "x"},
                {word: "y"},
                {word: "z"}
            ],
            values: [
                {expression: {elements: [
                    {number: "1"}
                ]}},
                {default: true},
                {expression: {elements: [
                    {number: "3"}
                ]}}
            ]
        }
    },
    {
        str: "(name, note) = (select nm, nt from some_list)",
        result: {
            columns: [
                {word: "name"},
                {word: "note"}
            ],
            select: {
                columns: [
                    {expression: {elements: [
                        {link: [
                            {word: "nm"}
                        ]}
                    ]}},
                    {expression: {elements: [
                        {link: [
                            {word: "nt"}
                        ]}
                    ]}}
                ],
                from: [{
                    table: {link: [
                        {word: "some_list"}
                    ]}
                }]
            }
        }
    }
];
