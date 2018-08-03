"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("CorrectReturning", () => {
    
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


    it("insert with custom returning expression", async() => {
        let triggersCalls = [];

        class UpCounter {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(UpCounter);
        let row;

        // test counter
        assert.equal(triggersCalls.length, 0);
        await server.query("insert into units default values");
        assert.deepEqual(triggersCalls[0], {
            id: 1
        });

        triggersCalls = [];
        row = await server.query("insert row into units default values returning 100 as x");
        assert.deepEqual(row, {
            x: 100
        });
        assert.deepEqual(triggersCalls[0], {
            id: 2
        });
        
        triggersCalls = [];
        row = await server.query("insert row into units default values returning *, units.id as x");
        assert.deepEqual(row, {
            id: 3,
            x: 3
        });
        assert.deepEqual(triggersCalls[0], {
            id: 3
        });
        
    });

});
