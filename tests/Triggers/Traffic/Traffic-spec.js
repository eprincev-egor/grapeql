"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("Traffic trigger", () => {
    
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

    it("tree dates", async() => {
        const HOUR = 60 * 60 * 1000;

        class Traffic {
            getEvents() {
                return {
                    "update:traffic": "onUpdateTraffic",
                    "insert:traffic": "onInsertTraffic",
                    "delete:traffic": "onDeleteTraffic",

                    "update:orders": "onUpdateOrder"
                };
            }

            async onUpdateTraffic({db, row, changes}) {
                if (
                    "expected_begin_date" in changes ||
                    "duration_hours" in changes
                ) {
                    await this.onUpdateBeginOrDuration({
                        db, row
                    });
                }

                if ( "expected_delivery_date" in changes ) {
                    await this.onUpdateDeliveryDate({
                        db, row
                    });
                }
            }

            async onUpdateBeginOrDuration({db, row}) {
                let 
                    trafficId = row.id,
                    beginDate = Date.parse( row.expected_begin_date ),
                    durationMs = row.duration_hours * HOUR,
                    endDate = beginDate + durationMs;
                
                await db.query(`
                    update traffic set
                        expected_delivery_date = $date::timestamp without time zone
                    where
                        id = $id::integer
                `, {
                        $id: trafficId,
                        $date: endDate
                    });
                
                // update next traffic
                await db.query(`
                    update traffic set
                        expected_begin_date = $date::timestamp without time zone
                    where
                        id_prev_traffic = $id::integer
                `, {
                        $id: trafficId,
                        $date: endDate
                    });
            }

            async onUpdateDeliveryDate({db, row}) {
                let orderId = row.id_order;
                db.query(`
                    update orders set
                        end_date = (
                            select
                                max( expected_delivery_date )
                            from traffic
                            where
                                id_order = orders.id
                        )
                    where
                        id = $order_id::integer
                `, {
                        $order_id: orderId
                    });
            }

            async onInsertTraffic() {
                
            }

            async onDeleteTraffic() {
                
            }

            async onUpdateOrder({db, row, changes}) {
                if ( !changes.start_date ) {
                    return;
                }

                let orderId = row.id;

                await db.query(`
                    update traffic set
                        expected_begin_date = $start_date::timestamp without time zone
                    where
                        id_order = $order_id::integer and
                        id_prev_traffic is null
                `, {
                        $order_id: orderId,
                        $start_date: changes.start_date
                    });
            }
        }

        await server.triggers.create(Traffic);
        
        await server.query(`
            update orders set
                start_date = '2018-01-01T00:00:00.000Z'::timestamp without time zone
        `);

        let order = await server.query("select row end_date, start_date from orders");
        let end_date = +order.end_date; // to unix timestamp
        let start_date = +order.start_date; // to unix timestamp
        let diff = end_date - start_date;
        
        assert.equal(diff / HOUR, 144);
    });

});
