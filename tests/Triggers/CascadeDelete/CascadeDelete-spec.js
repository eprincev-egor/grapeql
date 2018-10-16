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

        await server.query(`
            insert into tree 
                (name) 
            values 
                ('root')
        `);

        await server.query(`
            insert into tree 
                (id_parent, name) 
            values
                (1, 'root/child 1'),
                (1, 'root/child 2')
        `);

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

    it("delete row and check trigger on cascade delete, level 3", async() => {
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

        await server.query(`
            insert into tree 
                (name) 
            values 
                ('root')
        `);

        await server.query(`
            insert into tree 
                (id_parent, name) 
            values
                (1, 'root/child 1'),
                (1, 'root/child 2')
        `);

        await server.query(`
            insert into tree 
                (id_parent, name) 
            values
                (2, 'root/child 1/child 1'),
                (3, 'root/child 2/child 1')
        `);

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
            },
            {
                id: 4,
                id_parent: 2,
                name: "root/child 1/child 1"
            },
            {
                id: 5,
                id_parent: 3,
                name: "root/child 2/child 1"
            }
        ]);
    });

});
