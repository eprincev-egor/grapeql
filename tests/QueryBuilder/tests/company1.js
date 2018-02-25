(function() {
    "use strict";
    
    let company1 = {
        testName: "company1",
        
        tests: [
            {
                reqeustNode: "Company",
                reqeust: {
                    columns: ["id", "inn", "name"],
                    offset: 0,
                    limit: 2
                },
                
                result: `
                    select
                        _grape_query_columns.*
                    from company
                    
                    left join lateral (select 
                        id as "id",
                        public.company.inn as "inn",
                        coalesce( company.name, '(Не определено)' )  as "name"
                    ) as _grape_query_columns on true
                    
                    limit 2
                `
            },
            
            {
                reqeustNode: "Company",
                reqeust: {
                    columns: ["id", "INN"],
                    offset: 1
                },
                
                result: `
                    select
                        _grape_query_columns.*
                    from company
                    
                    left join lateral(select
                        id as "id",
                        public.company.inn as "INN"
                    ) as _grape_query_columns on true
                    
                    offset 1
                `
            },
            
            {
                reqeustNode: "Company",
                reqeust: {
                    columns: ["id"],
                    offset: 1,
                    where: ["ID", "=", 1]
                }
            }
        ],
        
        nodes: {
            Company: `
            select 
                id,
                * ,
                coalesce( company.name, '(Не определено)' ) as name
            from company
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
                            }
                        }
                    }
                }        
            }
        }
    };
    
    
    window.tests.list.push(company1);
})();
