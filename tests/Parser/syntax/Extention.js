"use strict";

module.exports = [
    {
        str: "extention test for orders (sale_Sum numeric(10 ,2))",
        result: {
            name: {word: "test"},
            table: {link: [
                {word: "orders"}
            ]},
            columnsArr: [
                {
                    name: {word: "sale_Sum"},
                    type: {type: "numeric(10,2)"}
                }
            ],
            columns: {
                sale_sum: {
                    name: {word: "sale_Sum"},
                    type: {type: "numeric(10,2)"}
                }
            },
            constraints: []
        }
    },
    {
        str: `extention test for orders (
            name text,
            unique (name)
        )`,
        result: {
            name: {word: "test"},
            table: {link: [
                {word: "orders"}
            ]},
            columnsArr: [
                {
                    name: {word: "name"},
                    type: {type: "text"}
                }
            ],
            columns: {
                name: {
                    name: {word: "name"},
                    type: {type: "text"}
                }
            },
            constraints: [
                {
                    unique: {
                        columns: [
                            {word: "name"}
                        ]
                    }
                }
            ]
        }
    },
    {
        str: `extention test for orders (
            name text,
            unique (name),
            name2 text
        )`,
        result: {
            name: {word: "test"},
            table: {link: [
                {word: "orders"}
            ]},
            columnsArr: [
                {
                    name: {word: "name"},
                    type: {type: "text"}
                },
                {
                    name: {word: "name2"},
                    type: {type: "text"}
                }
            ],
            columns: {
                name: {
                    name: {word: "name"},
                    type: {type: "text"}
                },
                name2: {
                    name: {word: "name2"},
                    type: {type: "text"}
                }
            },
            constraints: [
                {
                    unique: {
                        columns: [
                            {word: "name"}
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "extention test for orders (x text, x text)",
        error: Error
    }
];
