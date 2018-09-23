"use strict";

describe("RemoveJoins", () => {
    const {testRemoveUnnecessary} = require("../../utils/init")(__dirname);
    
    testRemoveUnnecessary(`
            select
                company.id as "country.id"
            from company

            left join country on
                country.id = company.id_country
        `, `
            select
                company.id as "country.id"
            from company
    `);
/*
    testRemoveUnnecessary(`
        with 
            x as (
                select
                    id,
                    country.code as x
                from company

                left join country on
                    country.id = company.id_country
            )
        select id
        from x
    `, `
        with 
            x as (
                select
                    id
                from company
            )
        select id
        from x
    `);
*/
});
