(function() {
    "use strict";
    
    let company1 = {
        testName: "company1",
        
        tests: [
            {
                reqeustNode: "Company",
                request: {
                    columns: ["id", "inn", "name"],
                    offset: 0,
                    limit: 2
                },
                
                result: `
                    select
                        _grape_query_columns."id",
                        _grape_query_columns."inn",
                        _grape_query_columns."name"
                    from company
                    
                    left join lateral (select 
                        company.id as "id",
                        public.company.inn as "inn",
                        coalesce( company.name, '(Не определено)' )  as "name"
                    ) as _grape_query_columns on true
                    
                    limit 2
                `
            },
            
            {
                reqeustNode: "Company",
                request: {
                    columns: ["id", "INN"],
                    offset: 1
                },
                
                result: `
                    select
                        _grape_query_columns."id",
                        _grape_query_columns."INN"
                    from company
                    
                    left join lateral(select
                        company.id as "id",
                        public.company.inn as "INN"
                    ) as _grape_query_columns on true
                    
                    offset 1
                `
            },
            
            {
                reqeustNode: "Company",
                request: {
                    columns: ["id"],
                    offset: 1,
                    where: ["id", "=", 1]
                },
                result: `
                    select
                        _grape_query_columns."id"
                    from company
                    
                    left join lateral(select
                        company.id as "id"
                    ) as _grape_query_columns on true
                    
                    where
                        _grape_query_columns."id" = 1
                    offset 1
                `
            }
        ],
        
        nodes: {
            Company: `
            select 
                company.id,
                * ,
                coalesce( company.name, '(Не определено)' ) as name
            from company
            
            left join country on
                country.id = company.id_country
            `
        },
        
        schemes: {
            public: {
                tables: {
                    company: {
                        name: "company",
                        scheme: null,
                        columns: {
                            id: {
                                name: "id",
                                type: "integer"
                            },
                            name: {
                                name: "name",
                                type: "text"
                            },
                            inn: {
                                name: "inn",
                                type: "text"
                            },
                            id_country: {
                                name: "id_country",
                                type: "integer"
                            }
                        }
                    },
                    country: {
                        name: "country",
                        scheme: null,
                        columns: {
                            id: {
                                name: "id",
                                type: "integer"
                            }
                        },
                        constraints: {
                            country_pk: {
                                type: "primary key",
                                name: "country_pk",
                                columns: ["id"]
                            }
                        }
                    }
                },
                functions: {},
                
                getFunction(name/*, args */) {
                    return this.functions[ name ];
                }
            }
        }
    };
    
    
    window.tests.list.push(company1);
})();
