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
        let vars;
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
                    endDate = this.mathEndDate(
                        row.expected_begin_date,
                        row.duration_hours
                    );
                
                vars = {
                    $id: trafficId,
                    $date: endDate
                };
                await db.query(`
                    update traffic set
                        expected_delivery_date = $date::timestamp without time zone
                    where
                        id = $id::integer
                `, vars);
                
                // update next traffic
                vars = {
                    $id: trafficId,
                    $date: endDate
                };
                await db.query(`
                    update traffic set
                        expected_begin_date = $date::timestamp without time zone
                    where
                        id_prev_traffic = $id::integer
                `, vars);
            }

            async onUpdateDeliveryDate({db, row}) {
                let orderId = row.id_order;
                await this.updateOrderEndDate( db, orderId );
            }

            async onInsertTraffic({db, row}) {
                let trafficId = row.id,
                    beginDate = row.expected_begin_date, 
                    endDate = row.expected_delivery_date;
                
                if ( beginDate && endDate ) {
                    return;
                }

                if ( !beginDate ) {
                    if ( row.id_prev_traffic ) {
                        let prevRow = await db.query(`
                            select row
                                expected_delivery_date
                            from traffic
                            where id = $prev_id::integer
                        `, { $prev_id: row.id_prev_traffic });
                        
                        beginDate = prevRow.expected_delivery_date;
                    } else {
                        let orderRow = await db.query(`
                            select row
                                start_date
                            from orders
                            where id = $order_id::integer
                        `, { $order_id: row.id_order });
                        beginDate = orderRow.start_date;
                    }
                }

                // no endData is value from original insert
                // just update beginDate
                if ( endDate ) {
                    vars = {
                        $id: trafficId,
                        $date: beginDate
                    };
                    await db.query(`
                        update traffic set
                            expected_begin_date = $date::timestamp without time zone
                        where id = $id::integer
                    `, vars);
                    return;
                }

                vars = {
                    $id: trafficId,
                    $begin_date: beginDate,
                    $end_date: endDate
                };

                await db.query(`
                    update traffic set
                        expected_begin_date = $begin_date::timestamp without time zone,
                        expected_delivery_date = $end_date::timestamp without time zone
                    where id = $id::integer
                `, vars);
            }

            mathEndDate(beginDate, durationHours) {
                beginDate = Date.parse( beginDate );
                let durationMs = durationHours * HOUR;

                return beginDate + durationMs;
            }

            async onDeleteTraffic({db, row}) {
                await this.updateOrderEndDate(db, row.id_order);
            }

            async onUpdateOrder({db, row, changes}) {
                if ( !changes.start_date ) {
                    return;
                }

                let orderId = row.id;

                vars = {
                    $order_id: orderId,
                    $start_date: changes.start_date
                };
                await db.query(`
                    update traffic set
                        expected_begin_date = $start_date::timestamp without time zone
                    where
                        id_order = $order_id::integer and
                        id_prev_traffic is null
                `, vars);
            }
            
            async updateOrderEndDate(db, orderId) {
                await db.query(`
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
                `, { $order_id: orderId });
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

        
        let traffic, row;

        row = await server.query(`
            insert row into traffic 
                (id_order, duration_hours, to_point)
            values
                (1, 168, 'Tokyo')
        `);

        traffic = await server.query(`
            select row *
            from traffic
            where id = $id::integer
        `, { $id: row.id });
        
        assert.deepEqual(traffic, {
            id: 4,
            id_order: 1,
            id_prev_traffic: null,
            duration_hours: 168,
            to_point: "Tokyo",
            expected_begin_date: new Date(2018, 0, 1),
            expected_delivery_date: new Date(2018, 0, 8),
            actual_delivery_date: null
        });

        order = await server.query(`
            select row *
            from orders
            where id = 1
        `);

        assert.deepEqual(order, {
            id: 1,
            start_date: new Date(2018, 0, 1),
            end_date: new Date(2018, 0, 8)
        });



        await server.query("delete from traffic where id = $id::integer", {
            $id: traffic.id
        });

        order = await server.query(`
            select row *
            from orders
            where id = 1
        `);

        assert.deepEqual(order, {
            id: 1,
            start_date: new Date(2018, 0, 1),
            end_date: new Date(2018, 0, 7)
        });


        
        //
        row = await server.query(`
            insert row into traffic 
                (id_order, id_prev_traffic, duration_hours, to_point)
            values
                (1, 3, 48, 'Tokyo')
        `);

        traffic = await server.query(`
            select row *
            from traffic
            where id = $id::integer
        `, { $id: row.id });
        
        assert.deepEqual(traffic, {
            id: 5,
            id_order: 1,
            id_prev_traffic: 3,
            duration_hours: 48,
            to_point: "Tokyo",
            expected_begin_date: new Date(2018, 0, 7),
            expected_delivery_date: new Date(2018, 0, 9),
            actual_delivery_date: null
        });

        order = await server.query(`
            select row *
            from orders
            where id = 1
        `);

        assert.deepEqual(order, {
            id: 1,
            start_date: new Date(2018, 0, 1),
            end_date: new Date(2018, 0, 9)
        });
    });

});
