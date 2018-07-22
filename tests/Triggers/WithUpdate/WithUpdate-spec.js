"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("WithUpdate trigger", () => {
    
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

    it("with (update..) select", async() => {
        class TestWithUpdate {
            getEvents() {
                return {
                    "update:orders": "onUpdate"
                };
            }

            async onUpdate({db, row}) {
                await db.query(`
                    insert into counter (
                        id_order,
                        counts
                    ) values (
                        $order_id::integer,
                        1
                    )
                    on conflict (id_order)
                    do update set
                        counts = (select counts + 1 from counter where id_order = excluded.id_order)
                `, {
                        $order_id: row.id
                    });
            }
        }

        server.triggers.create(TestWithUpdate);
        
        let orderRow = await server.query("insert row into orders default values");
        assert.equal(orderRow.id, 1);
        assert.equal(orderRow.name, null);

        let row = await server.query(`
            with
                updated_orders as (
                    update orders set
                        name = $name::text
                    returning id
                )
            select row
                count( * ) as updated_count,
                array_agg( id ) as updated_ids
            from updated_orders
        `, {
                $name: "Hello"
            });

        assert.equal(row.updated_count, 1);
        assert.ok(row.updated_ids instanceof Array);
        assert.equal(row.updated_ids.join(""), "1");
        
        row = await server.query(`
            select row *
            from counter
        `);

        assert.equal(row.counts, 1);
        assert.equal(row.id_order, 1);
    });

});
