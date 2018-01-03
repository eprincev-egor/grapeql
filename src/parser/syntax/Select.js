"use strict";
const Syntax = require("./Syntax");

// https://www.postgresql.org/docs/9.5/static/sql-select.html
/*

[ WITH [ RECURSIVE ] with_query [, ...] ]
SELECT [ ALL | DISTINCT [ ON ( expression [, ...] ) ] ]
    [ * | expression [ [ AS ] output_name ] [, ...] ]
    [ FROM from_item [, ...] ]
    [ WHERE condition ]
    [ GROUP BY grouping_element [, ...] ]
    [ HAVING condition [, ...] ]
    [ WINDOW window_name AS ( window_definition ) [, ...] ]
    [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
    [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
    [ LIMIT { count | ALL } ]
    [ OFFSET start [ ROW | ROWS ] ]
    [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]

where from_item can be one of:

    [ ONLY ] table_name [ * ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
                [ TABLESAMPLE sampling_method ( argument [, ...] ) [ REPEATABLE ( seed ) ] ]
    [ LATERAL ] ( select ) [ AS ] alias [ ( column_alias [, ...] ) ]
    with_query_name [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] ) [ AS ] alias ( column_definition [, ...] )
    [ LATERAL ] function_name ( [ argument [, ...] ] ) AS ( column_definition [, ...] )
    [ LATERAL ] ROWS FROM( function_name ( [ argument [, ...] ] ) [ AS ( column_definition [, ...] ) ] [, ...] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    from_item [ NATURAL ] join_type from_item [ ON join_condition | USING ( join_column [, ...] ) ]

and grouping_element can be one of:

    ( )
    expression
    ( expression [, ...] )
    ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
    CUBE ( { expression | ( expression [, ...] ) } [, ...] )
    GROUPING SETS ( grouping_element [, ...] )

and with_query is:

    with_query_name [ ( column_name [, ...] ) ] AS ( select  )

TABLE [ ONLY ] table_name [ * ]
 */

class Select extends Syntax {
    parse(coach) {
        this.parseWith(coach);
        
        coach.expectWord("select");
        coach.skipSpace();
        
        this.columns = coach.parseComma("Column");
        coach.skipSpace();
        
        this.parseFrom(coach);
        this.parseWhere(coach);
        this.parseHaving(coach);
        this.parseOffsets(coach);
    }
    
    parseWith(coach) {
        if ( !coach.isWord("with") ) {
            return;
        }
        coach.expect(/with\s+/i);
        
        // [ RECURSIVE ] with_query_name [ ( column_name [, ...] ) ] AS ( select  )
        let queries = coach.parseComma("WithQuery");
        
        if ( !queries.length ) {
            coach.throwError("expected with_query");
        }
        
        this.with = queries;
        coach.skipSpace();
    }
    
    parseFrom(coach) {
        coach.expectWord("from");
        coach.skipSpace();
        
        if ( coach.is("(") ) {
            coach.i++;
            coach.skipSpace();
            
            this.from = {
                select: coach.parseSelect()
            };
            
            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();
            
            let i = coach.i;
            let as = coach.parseAs();
            if ( !as.alias ) {
                coach.i = i;
                
                coach.throwError("expected alias");
            }
            this.from.as = as;
            
        } else {
            this.from = {
                // don't sort it
                table: coach.parseObjectLink(),
                as: coach.parseAs()
            };
        }
        
        coach.skipSpace();
    }
    
    parseWhere(coach) {
        this.where = null;
        
        if ( coach.isWord("where") ) {
            coach.readWord();
            coach.skipSpace();
            this.where = coach.parseExpression();
            
            coach.skipSpace();
        }
    }
    
    parseHaving(coach) {
        this.having = null;
        coach.skipSpace();
        
        if ( coach.isWord("having") ) {
            coach.readWord();
            coach.skipSpace();
            this.having = coach.parseExpression();
            
            coach.skipSpace();
        }
    }
    
    /*
        [ LIMIT { count | ALL } ]
        [ OFFSET start [ ROW | ROWS ] ]
        [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
     */
    parseOffsets(coach) {
        this.offset = null;
        this.limit = null;
        this.fetch = null;
        
        let hasOffset, hasLimit, hasFetch;
        
        hasOffset = this.parseOffset(coach);
        hasLimit = this.parseLimit(coach);
        hasFetch = this.parseFetch(coach);
        
        !hasOffset && this.parseOffset(coach);
        !hasLimit && this.parseLimit(coach);
        !hasFetch && this.parseFetch(coach);
        
        !hasOffset && this.parseOffset(coach);
        !hasLimit && this.parseLimit(coach);
        !hasFetch && this.parseFetch(coach);
        
        coach.skipSpace();
    }
    
    // [ OFFSET start [ ROW | ROWS ] ]
    parseOffset(coach) {
        if ( coach.isWord("offset") ) {
            coach.readWord(); // offset
            coach.skipSpace();
            
            let start = coach.expect(/\d+/);
            this.offset = +start;
                
            if ( coach.isWord("row") || coach.isWord("rows") ) {
                coach.skipSpace();
                coach.readWord(); // row || rows
            }
            
            coach.skipSpace();
            return true;
        }
    }
    
    // [ LIMIT { count | ALL } ]
    parseLimit(coach) {
        if ( coach.isWord("limit") ) {
            coach.readWord(); // limit
            coach.skipSpace();
            
            let count = coach.expect(/all|\d+/);
                
            if ( +count === +count ) {
                this.limit = +count;
            }
            else {
                this.limit = "all";
            }
            
            coach.skipSpace();
            return true;
        }
    }
    
    // [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
    parseFetch(coach) {
        if ( coach.isWord("fetch") ) {
            coach.readWord(); // fetch
            coach.skipSpace();
            
            let firstOrNext = coach.expect(/first|next/i);
            coach.skipSpace();
            
            let count = 1;
            // count ?
            if ( coach.is(/\d/) ); {
                count = +coach.expect(/\d+/);
                if ( count !== count ) { // NaN
                    count = 1;
                }
                coach.skipSpace();
            }
            
            // { ROW | ROWS } ONLY
            coach.expect(/rows?\s+only/i);
            
            this.fetch = {};
            this.fetch[ firstOrNext ] = count;
            
            coach.skipSpace();
            return true;
        }
    }
    
    is(coach) {
        return coach.isWord("select") || coach.isWord("with");
    }
}

Select.keywords = [
    "from",
    "where",
    "select",
    "with"
];

Select.tests = [
    {
        str: "select * from company",
        result: {
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
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {
                    alias: null
                }
            }
        }
    },
    {
        str: "select company.id as id, null as n from public.company",
        result: {
            columns: [
                {
                    as: {alias: "id"},
                    expression: {elements: [
                        {link: [
                            {word: "company"},
                            {word: "id"}
                        ]}
                    ]}
                },
                {
                    as: {alias: "n"},
                    expression: {elements: [
                        {null: true}
                    ]}
                }
            ],
            from: {
                table: {link: [
                    {word: "public"},
                    {word: "company"}
                ]},
                as: {alias: null}
            }
        }
    },
    {
        str: "select * from ( select * from public.order ) as Orders",
        result: {
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
            from: {
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
                    from: {
                        table: {link: [
                            {word: "public"},
                            {word: "order"}
                        ]},
                        as: {alias: null}
                    }
                },
                as: {alias: "orders"}
            }
        }
    },
    {
        str: "select from company where id = 1",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            where: {elements: [
                {link: [
                    {word: "id"}
                ]},
                {operator: "="},
                {number: "1"}
            ]}
        }
    },
    {
        str: "select from company having id = 1",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            having: {elements: [
                {link: [
                    {word: "id"}
                ]},
                {operator: "="},
                {number: "1"}
            ]}
        }
    },
    {
        str: "select from company offset 1 limit 10",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            offset: 1,
            limit: 10
        }
    },
    {
        str: "select from company limit all offset 100",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            offset: 100,
            limit: "all"
        }
    },
    {
        str: "select from company fetch first 5 rows only",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            fetch: {first: 5}
        }
    },
    {
        str: "select from company fetch next 1 row only",
        result: {
            columns: [],
            from: {
                table: {link: [
                    {word: "company"}
                ]},
                as: {alias: null}
            },
            fetch: {next: 1}
        }
    },
    {
        str: "with orders as (select * from company) select * from orders",
        result: {
            with: [
                {
                    name: {word: "orders"},
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
                        from: {
                            table: {link: [
                                {word: "company"}
                            ]},
                            as: {
                                alias: null
                            }
                        }
                    }
                }
            ],
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
            from: {
                table: {link: [
                    {word: "orders"}
                ]},
                as: {
                    alias: null
                }
            }
        }
    }
];

module.exports = Select;
