"use strict";

module.exports = [
    {
        str: "any(array[1])",
        result: {
            type: "any",
            array: {elements: [
                {items: [
                    {elements: [
                        {number: "1"}
                    ]}
                ]}
            ]}
        }
    },
    {
        str: "some(array[1])",
        result: {
            type: "some",
            array: {elements: [
                {items: [
                    {elements: [
                        {number: "1"}
                    ]}
                ]}
            ]}
        }
    },
    {
        str: "all(array[1])",
        result: {
            type: "all",
            array: {elements: [
                {items: [
                    {elements: [
                        {number: "1"}
                    ]}
                ]}
            ]}
        }
    },

    {
        str: "any(select id from (select 1 as id) as tmp)",
        result: {
            type: "any",
            select: {
                columns: [
                    {
                        expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]}
                    }
                ],
                from: [{
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
                            }
                        ]
                    },
                    as: {word: "tmp"}
                }]
            }
        }
    },

    {
        str: "all(select id from (select 1 as id) as tmp)",
        result: {
            type: "all",
            select: {
                columns: [
                    {
                        expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]}
                    }
                ],
                from: [{
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
                            }
                        ]
                    },
                    as: {word: "tmp"}
                }]
            }
        }
    },

    {
        str: "some(select id from (select 1 as id) as tmp)",
        result: {
            type: "some",
            select: {
                columns: [
                    {
                        expression: {elements: [
                            {link: [
                                {word: "id"}
                            ]}
                        ]}
                    }
                ],
                from: [{
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]},
                                as: {word: "id"}
                            }
                        ]
                    },
                    as: {word: "tmp"}
                }]
            }
        }
    }
];
