"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("UpdateFrom trigger", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);
        await db.end();

        // run server
        config.http = false;
        server = await GrapeQL.start( config );
    });

    afterEach(async() => {
        if ( !server ) {
            return;
        }

        await server.stop();
        server = null;
    });

    it("update ... from ... ", async() => {
        let triggersCalls = [];

        class TestUpdate {
            getEvents() {
                return {
                    "update:orders": "onUpdate"
                };
            }

            async onUpdate({row, prev, changes}) {
                triggersCalls.push({row, prev, changes});
            }
        }

        await server.triggers.create(TestUpdate);

        let order = await server.query(`
            insert row into orders
                (client)
            values
                ('Bob')
        `);

        assert.deepEqual(order, {
            id: 1,
            client: "Bob",
            sale_sum: "0.00",
            buy_sum: "0.00",
            profit: "0.00"
        });

        await server.query(`
            insert into buys
                (id_order, sum, name)
            values
                (1, 10,   'Motherboard'),
                (1, 20,   'Processor 6x3.6 OEM'),
                (1, 15,   'RAM 8gb'),
                (1, 12.5, 'SSD disk 128gb'),
                (1, 12.5, 'SSD disk 128gb'),
                (1, 5,    'Computer case 450W')
        `);

        await server.query(`
            insert into sales
                (id_order, sum, name)
            values
                (1, 85, 'Computer'),
                (1, 10, 'Assembly'),
                (1, 5,  'Delivery')
        `);

        let row;
        let sql = `
            update orders set
                sale_sum = totals.sale_sum,
                buy_sum = totals.buy_sum,
                profit = totals.profit
            from (
                with
                    sales as (
                        select sum( sum )
                        from sales
                        where id_order = 1
                    ),
                    buys as (
                        select sum( sum )
                        from buys
                        where id_order = 1
                    )
                select
                    1 as id_order,
                    sales.sum as sale_sum,
                    buys.sum as buy_sum,
                    sales.sum - buys.sum as profit
                    
                from (select) as tmp
                left join sales on true
                left join buys on true
            ) as totals

            where
                totals.id_order = orders.id and
                (
                    orders.sale_sum is distinct from totals.sale_sum
                    or
                    orders.buy_sum is distinct from totals.buy_sum
                )
            
            returning row totals.*
        `;
        row = await server.query(sql);

        assert.deepEqual(row, {
            id_order: 1,
            sale_sum: "100.00",
            buy_sum: "75.00",
            profit: "25.00"
        });

        assert.deepEqual(triggersCalls, [
            {
                row: {
                    id: 1,
                    client: "Bob",
                    sale_sum: "100.00",
                    buy_sum: "75.00",
                    profit: "25.00"
                },
                prev: {
                    id: 1,
                    client: "Bob",
                    sale_sum: "0.00",
                    buy_sum: "0.00",
                    profit: "0.00"
                },
                changes: {
                    sale_sum: "100.00",
                    buy_sum: "75.00",
                    profit: "25.00"
                }
            }
        ]);

        row = await server.query(sql);
        assert.equal(row, null);
        assert.equal(triggersCalls.length, 1);
    });

    it("update from (...), (...) ", async() => {
        let triggersCalls = [];

        class TestUpdate {
            getEvents() {
                return {
                    "update:contracts": "onUpdate"
                };
            }

            async onUpdate({row, prev, changes}) {
                triggersCalls.push({row, prev, changes});
            }
        }
        
        await server.triggers.create(TestUpdate);

        await server.query(`
            update contracts set
                status = 'payed'
            from 
                unnest( $companies::integer[] ) as company_a,
                unnest( $companies::integer[] ) as company_b
            
            where
                contracts.id_company_contractor = company_a  and 
                contracts.id_company_payer      = company_b
        `, { $companies: [1, 2, 3] });
        
        assert.deepEqual(triggersCalls, [
            // 1
            {
                row: {
                    id: 1,
                    id_company_contractor: 1,
                    id_company_payer: 2,
                    status: "payed"
                },
                prev: {
                    id: 1,
                    id_company_contractor: 1,
                    id_company_payer: 2,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            },
            {
                row: {
                    id: 2,
                    id_company_contractor: 1,
                    id_company_payer: 3,
                    status: "payed"
                },
                prev: {
                    id: 2,
                    id_company_contractor: 1,
                    id_company_payer: 3,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            },

            // 2
            {
                row: {
                    id: 3,
                    id_company_contractor: 2,
                    id_company_payer: 1,
                    status: "payed"
                },
                prev: {
                    id: 3,
                    id_company_contractor: 2,
                    id_company_payer: 1,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            },
            {
                row: {
                    id: 4,
                    id_company_contractor: 2,
                    id_company_payer: 3,
                    status: "payed"
                },
                prev: {
                    id: 4,
                    id_company_contractor: 2,
                    id_company_payer: 3,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            },

            // 3
            {
                row: {
                    id: 5,
                    id_company_contractor: 3,
                    id_company_payer: 1,
                    status: "payed"
                },
                prev: {
                    id: 5,
                    id_company_contractor: 3,
                    id_company_payer: 1,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            },
            {
                row: {
                    id: 6,
                    id_company_contractor: 3,
                    id_company_payer: 2,
                    status: "payed"
                },
                prev: {
                    id: 6,
                    id_company_contractor: 3,
                    id_company_payer: 2,
                    status: null
                },
                changes: {
                    status: "payed"
                }
            }
        ]);
    });
});
