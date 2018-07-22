"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("WithInsert trigger", () => {
    
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

    it("with (insert..) select", async() => {
        class TestWithInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({db, row}) {
                let orderId = row.id_order;

                await db.query(`
                    update orders set 
                        units_names = (
                            select string_agg( name, ';' order by name )
                            from units
                            where
                                id_order = orders.id
                        ) 
                    where 
                        id = $order_id::integer
                `, {
                        $order_id: orderId
                    });
            }
        }

        server.triggers.create(TestWithInsert);
        
        let orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 1);
        assert.ok(orderRow.units_names === null);

        let row = await server.query(`
            with
                inserted_units as (
                    insert into units (
                        id_order,
                        name
                    ) 
                    values 
                        ($order_id::integer, $name_1::text),
                        ($order_id::integer, $name_2::text)
                    returning id
                )
            select row
                count( * ) as inserted_count,
                array_agg( id ) as inserted_ids
            from inserted_units
        `, {
                $order_id: orderRow.id,
                $name_1: "Hello",
                $name_2: "World"
            });

        assert.equal(row.inserted_count, 2);
        assert.ok(row.inserted_ids instanceof Array);
        assert.equal(row.inserted_ids.join(","), "1,2");
        
        orderRow = await server.query(`
            select row 
                units_names 
            from orders 
            where id = $order_id::integer
        `, {
                $order_id: orderRow.id
            });

        assert.equal(orderRow.units_names, "Hello;World");
    });

});
