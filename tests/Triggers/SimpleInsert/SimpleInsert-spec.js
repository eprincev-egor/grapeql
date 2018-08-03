"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleInsert trigger", () => {
    
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


    it("insert order and insert unit", async() => {
        class CreateUnit {
            getEvents() {
                return {
                    "insert:orders": "onInsert"
                };
            }

            async onInsert({db, row}) {
                await db.query(`
                    insert into units 
                    (id_order)
                    values
                    ($order_id::integer)
                `, {
                        order_id: row.id
                    });
            }
        }

        await server.triggers.create(CreateUnit);

        let orderRow = await server.query("insert row into orders default values");
        assert.ok(orderRow.id == 1);

        let unitRow = await server.query("select row * from units where id_order = $order_id::integer", {
            order_id: orderRow.id
        });
        
        assert.ok(unitRow.id == 1);
        assert.ok(unitRow.id_order == 1);
       
        assert.ok(true);
    });

    it("insert row, and wait trigger error", async() => {
        class TriggerError {
            getEvents() {
                return {
                    "insert:units": "throwError"
                };
            }
            
            throwError({row}) {
                let unitRow = row;

                if ( unitRow.id >= 3 ) {
                    throw new Error("test trigger error");
                }
            }
        }

        await server.triggers.create(TriggerError);
        let unitRow, orderRow;

        orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 1, "order with id 1");

        unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow.id
        });
        assert.equal(unitRow.id, 1, "unit with id 1");
        assert.equal(unitRow.id_order, 1, "unit with id_order 1");

        unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow.id
        });
        assert.equal(unitRow.id, 2, "unit with id 2");
        assert.equal(unitRow.id_order, 1, "unit with id_order 1");

        try {
            unitRow = await server.query("insert row into units (id_order) values ($order_id::integer)", {
                $order_id: orderRow.id
            });
            assert.ok(false, "expected error");
        } catch(err) {
            assert.equal(err.message, "test trigger error");
        }
        
    });

});
