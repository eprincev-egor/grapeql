"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("RollbackLastOnError trigger", () => {
    
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


    it("inserted row must be remove, if has error in triggers", async() => {
        class ThrowError {
            getEvents() {
                return {
                    "insert:test": "onInsert"
                };
            }

            async onInsert({row}) {
                if ( row.name == "error" ) {
                    throw new Error("test rollback");
                }
            }
        }

        await server.triggers.create(ThrowError);
        let transaction = await server.transaction();
        
        await transaction.query(`
            insert into test 
                (name) 
            values 
                ('success')
        `);
        
        try {
            await transaction.query(`
                insert into test 
                    (name) 
                values 
                    ('error')
            `);

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "test rollback");
        }
        
        let result;

        result = await transaction.query(`
            select * from test
        `);

        assert.deepEqual(result, [
            {
                id: 1,
                name: "success"
            }
        ]);

        await transaction.end();
    });

});
