"use strict";

module.exports = [
    {
        str: "left join country on country.id = company.countryId",
        result: {
            type: "left join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {link: [
                    {word: "country"},
                    {word: "id"}
                ]},
                {operator: "="},
                {link: [
                    {word: "company"},
                    {word: "countryid"}
                ]}
            ]}
        }
    },
    {
        str: "Inner  Join country on true",
        result: {
            type: "inner join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "join country on true",
        result: {
            type: "join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "cross join country on true",
        result: {
            type: "cross join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "full outer join country on true",
        result: {
            type: "full outer join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "left outer join country on true",
        result: {
            type: "left outer join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "right outer join country on true",
        result: {
            type: "right outer join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "full outer join country on true",
        result: {
            type: "full outer join",
            from: {
                table: {link: [
                    {word: "country"}
                ]}
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "right join public.country as country using a1.\"X,\", b2 .y, \"c3\". z",
        result: {
            type: "right join",
            from: {
                table: {link: [
                    {word: "public"},
                    {word: "country"}
                ]},
                as: {alias: {word: "country"}}
            }, 
            using: [
                {link: [
                    {word: "a1"},
                    {content: "X,"}
                ]},
                {link: [
                    {word: "b2"},
                    {word: "y"}
                ]},
                {link: [
                    {content: "c3"},
                    {word: "z"}
                ]}
            ]
        }
    },
    {
        str: "left join lateral (select * from company) as sub_company on true",
        result: {
            type: "left join",
            from: {
                lateral: true,
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
                },
                as: {
                    alias: {word: "sub_company"}
                }
            },
            on: {elements: [
                {boolean: true}
            ]}
        }
    }
];