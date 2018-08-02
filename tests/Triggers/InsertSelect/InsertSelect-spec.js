"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("InsertSelect trigger", () => {
    
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
        let triggersCalls = [];

        class TestInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        server.triggers.create(TestInsert);

        let rows = await server.query(`
            insert into units
                (id_order, name)
            select
                2,
                units.name
            from units
            where 
                id_order = 1
        `);

        assert.deepEqual(rows, [
            {id: 4, id_order: 2, name: "red"},
            {id: 5, id_order: 2, name: "green"},
            {id: 6, id_order: 2, name: "blue"}
        ]);

        assert.deepEqual(triggersCalls, [
            {id: 4, id_order: 2, name: "red"},
            {id: 5, id_order: 2, name: "green"},
            {id: 6, id_order: 2, name: "blue"}
        ]);
    });

});
