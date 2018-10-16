"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("CascadeUpdate trigger", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);
        await db.end();

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


    it("on delete set null", async() => {
        let triggersCalls = [];
        class CascadeUpdateTest {
            getEvents() {
                return {
                    "update:orders": "onUpdate"
                };
            }

            async onUpdate({type, prev, row, changes}) {
                triggersCalls.push({
                    type, 
                    prev, 
                    row, 
                    changes
                });
            }
        }

        await server.triggers.create(CascadeUpdateTest);
        
        await server.query(`
            insert into countries
                (code)
            values
                ('RU')
        `);

        await server.query(`
            insert into companies
                (name, id_country)
            values
                ('MS', 1),
                ('APP', 1)
        `);

        await server.query(`
            insert into orders
                (id_company)
            values
                (1),
                (2)
        `);

        await server.query("delete from companies where name = 'MS'");

        assert.deepEqual(triggersCalls, [
            {
                type: "update",
                prev: {
                    id: 1,
                    id_company: 1
                },
                row: {
                    id: 1,
                    id_company: null
                },
                changes: {
                    id_company: null
                }
            }
        ]);
    });

    it("on delete set null, level 3", async() => {
        let triggersCalls = [];
        class CascadeUpdateTest {
            getEvents() {
                return {
                    "update:orders": "onUpdate"
                };
            }

            async onUpdate({type, prev, row, changes}) {
                triggersCalls.push({
                    type, 
                    prev, 
                    row, 
                    changes
                });
            }
        }

        await server.triggers.create(CascadeUpdateTest);
        
        await server.query(`
            insert into countries
                (code)
            values
                ('RU')
        `);

        await server.query(`
            insert into companies
                (name, id_country)
            values
                ('MS', 1),
                ('APP', 1)
        `);

        await server.query(`
            insert into orders
                (id_company)
            values
                (1),
                (2)
        `);

        await server.query("delete from countries where code = 'RU'");

        assert.deepEqual(triggersCalls, [
            {
                type: "update",
                prev: {
                    id: 1,
                    id_company: 1
                },
                row: {
                    id: 1,
                    id_company: null
                },
                changes: {
                    id_company: null
                }
            },
            {
                type: "update",
                prev: {
                    id: 2,
                    id_company: 2
                },
                row: {
                    id: 2,
                    id_company: null
                },
                changes: {
                    id_company: null
                }
            }
        ]);
    });

});
