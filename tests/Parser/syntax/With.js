"use strict";

module.exports = [
    {
        str: "with X as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with \"X\" as (select 1)",
        result: {
            queries: {
                X: {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with x as (select 1), y as (select 2)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with y as (select 2), x as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                },
                {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },

    {
        str: "with x as (select 2), x as (select 1)",
        error: Error
    },

    {
        str: "with x as (values(1,2),(3,4))",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    values: [
                        {items: [
                            {expression: {elements: [
                                {number: "1"}
                            ]}},
                            {expression: {elements: [
                                {number: "2"}
                            ]}}
                        ]},
                        {items: [
                            {expression: {elements: [
                                {number: "3"}
                            ]}},
                            {expression: {elements: [
                                {number: "4"}
                            ]}}
                        ]}
                    ]
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    values: [
                        {items: [
                            {expression: {elements: [
                                {number: "1"}
                            ]}},
                            {expression: {elements: [
                                {number: "2"}
                            ]}}
                        ]},
                        {items: [
                            {expression: {elements: [
                                {number: "3"}
                            ]}},
                            {expression: {elements: [
                                {number: "4"}
                            ]}}
                        ]}
                    ]
                }
            ]
        }
    },

    {
        str: "with x as (with x as (select 2) insert into orders select * from x returning *)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    insert: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
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
                                    {word: "x"}
                                ]}
                            }]
                        },
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    insert: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
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
                                    {word: "x"}
                                ]}
                            }]
                        },
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            ]
        }
    },

    {
        str: "with x as (with x as (select 2) update orders set id_client = (select * from x) returning *)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    update: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
                        set: [
                            {
                                column: {word: "id_client"},
                                value: {expression: {elements: [
                                    {
                                        columns: [{
                                            expression: {elements: [
                                                {link: ["*"]}
                                            ]}
                                        }],
                                        from: [{
                                            table: {link: [
                                                {word: "x"}
                                            ]}
                                        }]
                                    }
                                ]}}
                            }
                        ],
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    update: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
                        set: [
                            {
                                column: {word: "id_client"},
                                value: {expression: {elements: [
                                    {
                                        columns: [{
                                            expression: {elements: [
                                                {link: ["*"]}
                                            ]}
                                        }],
                                        from: [{
                                            table: {link: [
                                                {word: "x"}
                                            ]}
                                        }]
                                    }
                                ]}}
                            }
                        ],
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with x as (with x as (select 2) delete from orders where orders.id = (select * from x) returning *)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    delete: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
                        where: {elements: [
                            {link: [
                                {word: "orders"},
                                {word: "id"}
                            ]},
                            {operator: "="},
                            {
                                columns: [{
                                    expression: {elements: [
                                        {link: ["*"]}
                                    ]}
                                }],
                                from: [{
                                    table: {link: [
                                        {word: "x"}
                                    ]}
                                }]
                            }
                        ]},
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    delete: {
                        with: {
                            queries: {
                                x: {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            },
                            queriesArr: [
                                {
                                    name: {word: "x"},
                                    select: {
                                        columns: [{
                                            expression: {elements: [
                                                {number: "2"}
                                            ]}
                                        }]
                                    }
                                }
                            ]
                        },
                        table: {link: [
                            {word: "orders"}
                        ]},
                        where: {elements: [
                            {link: [
                                {word: "orders"},
                                {word: "id"}
                            ]},
                            {operator: "="},
                            {
                                columns: [{
                                    expression: {elements: [
                                        {link: ["*"]}
                                    ]}
                                }],
                                from: [{
                                    table: {link: [
                                        {word: "x"}
                                    ]}
                                }]
                            }
                        ]},
                        returning: [
                            {expression: {elements: [
                                {link: [
                                    "*"
                                ]}
                            ]}}
                        ]
                    }
                }
            ]
        }
    }
];
