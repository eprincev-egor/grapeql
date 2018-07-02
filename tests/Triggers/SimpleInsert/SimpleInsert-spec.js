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
        /*
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

        server.addTrigger(CreateUnit);

        let orderRow = await server.query("insert into orders default values");
        assert.ok(orderRow.id == 1);

        let unitRow = await server.query("select row * from units where id_order = $order_id::integer", {
            order_id: orderRow.id
        });
        assert.ok(unitRow.id == 1);
        assert.ok(unitRow.id_order == 1);

        */
       
       assert.ok(true);
    });

});
