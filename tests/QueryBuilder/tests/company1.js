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
                        id as "id",
                        public.company.inn as "inn",
                        coalesce( company.name, '(Не определено)' )  as "name"
                    from company
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
                        id as "id",
                        public.company.inn as "INN"
                    from company
                    offset 1
                `
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
    };
    
    
    window.tests.list.push(company1);
})();
