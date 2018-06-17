"use strict";

module.exports = [
    {
        str: "parent_window",
        result: {
            windowDefinition: {
                word: "parent_window"
            }
        }
    },
    {
        str: "partition by company.name, company.id",
        result: {
            partitionBy: [
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "name"}
                    ]}
                ]},
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            ]
        }
    },
    {
        str: "order by company.name asc, company.id desc",
        result: {
            orderBy: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "name"}
                        ]}
                    ]},
                    vector: "asc"
                },
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]},
                    vector: "desc"
                }
            ]
        }
    },
    {
        str: "range 1 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range 1 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                }
            }
        }
    },
    {
        str: "range between 1 preceding and 2 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between 1 preceding and 2 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "range between 1 following and 2 preceding",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between 1 following and 2 following",
        result: {
            range: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "range unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range current row",
        result: {
            range: {
                start: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "range between unbounded preceding and unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between unbounded preceding and unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and unbounded preceding",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and unbounded following",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between current row and unbounded following",
        result: {
            range: {
                start: {
                    currentRow: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "range between unbounded following and current row",
        result: {
            range: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "rows 1 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows 1 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows between 1 preceding and 2 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between 1 preceding and 2 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    preceding: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows between 1 following and 2 preceding",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between 1 following and 2 following",
        result: {
            rows: {
                start: {
                    value: {number: "1"},
                    following: true
                },
                end: {
                    value: {number: "2"},
                    following: true
                }
            }
        }
    },
    {
        str: "rows unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows current row",
        result: {
            rows: {
                start: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "rows between unbounded preceding and unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between unbounded preceding and unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    preceding: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and unbounded preceding",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    preceding: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and unbounded following",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between current row and unbounded following",
        result: {
            rows: {
                start: {
                    currentRow: true
                },
                end: {
                    unbounded: true,
                    following: true
                }
            }
        }
    },
    {
        str: "rows between unbounded following and current row",
        result: {
            rows: {
                start: {
                    unbounded: true,
                    following: true
                },
                end: {
                    currentRow: true
                }
            }
        }
    },
    {
        str: "parent_window partition by company.name, company.id order by company.name desc, company.id asc rows between current row and 100 following",
        result: {
            windowDefinition: {word: "parent_window"},
            partitionBy: [
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "name"}
                    ]}
                ]},
                {elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]}
            ],
            orderBy: [
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "name"}
                        ]}
                    ]},
                    vector: "desc"
                },
                {
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]},
                    vector: "asc"
                }
            ],
            rows: {
                start: {
                    currentRow: true
                },
                end: {
                    value: {number: "100"},
                    following: true
                }
            }
        }
    }
];
