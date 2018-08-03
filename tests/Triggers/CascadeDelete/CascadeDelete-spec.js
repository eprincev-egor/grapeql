"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("CascadeDelete trigger", () => {
    
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


    it("delete row and check trigger on cascade delete", async() => {
        let triggersCalls = [];
        class CascadeDeleteTest {
            getEvents() {
                return {
                    "delete:tree": "onDelete"
                };
            }

            async onDelete({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(CascadeDeleteTest);

        let row = await server.query("delete row from tree where name = 'root'");
        
        assert.deepEqual(row, {
            id: 1,
            id_parent: null,
            name: "root"
        });

        assert.deepEqual(triggersCalls, [
            {
                id: 1,
                id_parent: null,
                name: "root"
            },
            {
                id: 2,
                id_parent: 1,
                name: "root/child 1"
            },
            {
                id: 3,
                id_parent: 1,
                name: "root/child 2"
            }
        ]);

    });

});
