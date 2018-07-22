"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("WithDelete trigger", () => {
    
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

    it("with (delete..) select", async() => {
        class TestWithDelete {
            getEvents() {
                return {
                    "delete:units": "onDelete"
                };
            }

            async onDelete({db, row}) {
                let orderId = row.id_order;

                await db.query(`
                    update orders set 
                        units_count = units_count - 1
                    where 
                        id = $order_id::integer
                `, {
                        $order_id: orderId
                    });
            }
        }

        server.triggers.create(TestWithDelete);
        
        let orderRow = await server.query("insert row into orders (units_count) values (1)");
        assert.equal(orderRow.id, 1);
        assert.ok(orderRow.units_count === 1);

        await server.query("insert row into units (id_order) values ($order_id::integer)", {
            $order_id: orderRow.id
        });

        let row = await server.query(`
            with
                deleted_units as (
                    delete from units
                    where id = $order_id::integer
                    returning id
                )
            select row
                count( * ) as deleted_count,
                array_agg( id ) as deleted_ids
            from deleted_units
        `, {
                $order_id: orderRow.id
            });

        assert.equal(row.deleted_count, 1);
        assert.ok(row.deleted_ids instanceof Array);
        assert.equal(row.deleted_ids.join(""), "1");
        
        orderRow = await server.query(`
            select row 
                units_count
            from orders 
            where id = $order_id::integer
        `, {
                $order_id: orderRow.id
            });

        assert.equal(orderRow.units_count, "0");
    });

});
