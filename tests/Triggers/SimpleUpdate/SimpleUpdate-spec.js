"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleUpdate trigger", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);

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

    it("update unit.id_order, set order.units_count", async() => {
        class UpdateUnitsCount {
            getEvents() {
                return {
                    "update:units": "onUpdate"
                };
            }

            async onUpdate({db, prev, changes}) {
                if ( !("id_order" in changes) ) {
                    return;
                }

                if ( prev.id_order ) {
                    await db.query(`
                        update orders set
                            units_count = units_count - 1
                        where
                            id = $order_id::integer
                    `, {
                            $order_id: prev.id_order
                        });
                }
                
                if ( changes.id_order ) {
                    await db.query(`
                        update orders set
                            units_count = units_count + 1
                        where
                            id = $order_id::integer
                    `, {
                            $order_id: changes.id_order
                        });
                }
            }
        }

        server.triggers.create(UpdateUnitsCount);

        let orderRow1 = await server.query("insert row into orders (units_count) values (1)");
        assert.equal(orderRow1.id, 1);
        assert.equal(orderRow1.units_count, 1);

        let orderRow2 = await server.query("insert row into orders default values");
        assert.equal(orderRow2.id, 2);
        assert.equal(orderRow2.units_count, 0);

        let unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow1.id
        });
        
        assert.equal(unitRow.id, 1);
        assert.equal(unitRow.id_order, 1);



        await server.query("update units set id_order = 2 where id = 1");


        orderRow1 = await server.query("select row units_count from orders where id = 1");
        assert.equal(orderRow1.units_count, 0);

        orderRow2 = await server.query("select row units_count from orders where id = 2");
        assert.equal(orderRow2.units_count, 1);
       
        assert.ok(true);
    });

    it("update units as old_values", async() => {
        let triggersCalls = [];

        class TestUpdate {
            getEvents() {
                return {
                    "update:units": "onUpdate"
                };
            }

            onUpdate({row}) {
                triggersCalls.push(row);
            }
        }

        server.triggers.create(TestUpdate);

        let order = await server.query(`
            insert row into orders
            default values
        `);

        await server.query(`
            insert into units
                (id_order)
            values
                ($order_id::integer)
        `, {
                order_id: order.id
            });
        
        let unit = await server.query(`
            update row units as old_values set 
                doc_number = 'nice'
            returning 
                old_values.doc_number, 
                id
        `);

        assert.deepEqual(unit, {
            doc_number: "nice",
            id: 1
        });

        assert.deepEqual(triggersCalls, [
            {
                id: 1,
                id_order: 1,
                doc_number: "nice"
            }
        ]);
    });

});
