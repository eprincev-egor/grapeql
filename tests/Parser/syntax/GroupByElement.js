"use strict";

module.exports = [
    {
        str: "id",
        result: {
            expression: {elements: [
                {link: [
                    {word: "id"}
                ]}
            ]}
        }
    },
    {
        str: "GROUPING SETS (brand, size, ( ))",
        result: {
            groupingSets: [
                {expression: {elements: [
                    {link: [
                        {word: "brand"}
                    ]}
                ]}},
                {expression: {elements: [
                    {link: [
                        {word: "size"}
                    ]}
                ]}},
                {isEmpty: true}
            ]
        }
    },
    {
        str: "cube ( brand, (size, 1) )",
        result: {
            cube: [
                {elements: [
                    {link: [
                        {word: "brand"}
                    ]}
                ]},
                [
                    {elements: [
                        {link: [
                            {word: "size"}
                        ]}
                    ]},
                    {elements: [
                        {number: "1"}
                    ]}
                ]
            ]
        }
    },
    {
        str: "rollup ( brand, (size, 1) )",
        result: {
            rollup: [
                {elements: [
                    {link: [
                        {word: "brand"}
                    ]}
                ]},
                [
                    {elements: [
                        {link: [
                            {word: "size"}
                        ]}
                    ]},
                    {elements: [
                        {number: "1"}
                    ]}
                ]
            ]
        }
    }
];
