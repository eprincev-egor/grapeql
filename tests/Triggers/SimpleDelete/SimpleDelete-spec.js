"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleDelete trigger", () => {
    
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


    it("delete units on delete order", async() => {
        class DeleteUnits {
            getEvents() {
                return {
                    "delete:orders": "onDeleteOrder"
                };
            }

            async onDeleteOrder({db, row}) {
                let order = row;

                await db.query("delete from units where id_order = $order_id::integer", {
                    $order_id: order.id
                });
            }
        }

        await server.triggers.create(DeleteUnits);

        let orderRow, unitRow,
            unitRows;

        orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 1);

        unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow.id
        });
        assert.equal(unitRow.id, 1);

        unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow.id
        });
        assert.equal(unitRow.id, 2);

        
        unitRows = await server.query("select id, id_order from units where id_order = $order_id::integer", {
            $order_id: orderRow.id
        });
        assert.equal(unitRows[0].id, 1);
        assert.equal(unitRows[1].id, 2);


        await server.query("delete from orders where id = 1");

        unitRows = await server.query("select id, id_order from units where id_order = $order_id::integer", {
            $order_id: orderRow.id
        });
        assert.equal(unitRows.length, 0);

    });

    it("delete orders, trigger error", async() => {
        class TriggerError {
            getEvents() {
                return {
                    "delete:orders": "onDeleteOrder"
                };
            }

            onDeleteOrder({row}) {
                let order = row;
                
                if ( order.id >= 3 ) {
                    throw new Error("test trigger error");
                }
            }
        }

        await server.triggers.create(TriggerError);

        let orderRow;
        
        orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 1);

        orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 2);

        orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 3);

        try {
            await server.query("delete from orders");
            assert.ok(false, "expected error");
        } catch(err) {
            assert.equal(err.message, "test trigger error");
        }
        
        let rows = await server.query("delete from orders where id in (1,2)");
        assert.equal(rows[0].id, 1);
        assert.equal(rows[1].id, 2);
    });

});
