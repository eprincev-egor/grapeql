"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("RollbackAndCommit transaction", () => {
    
    let server;
    let transaction;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);
        await db.end();

        // run server
        config.http = false;
        server = await GrapeQL.start( config );
        
        // begin transaction
        transaction = await server.transaction();
    });

    afterEach(async() => {
        if ( transaction ) {
            try {
                await transaction.release();
            } catch(err) {
                console.log(err);
            }
            transaction = null;    
        }

        if ( server ) {
            await server.stop();
            server = null;
        }
    });


    it("insert and commit", async() => {
        let row, result;
        
        row = await transaction.query(`
            insert row into country default values
        `);
        
        assert.ok(row.id == 1);
        
        // rows hidden in another connection
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
        
        await transaction.commit();
        
        // rows visible in another connection, after commit
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 1);
        assert.ok(result.rows[0].id === 1);
    });

    it("insert and rollback", async() => {
        let row, result;
        
        row = await transaction.query(`
            insert row into country default values
        `);
        
        assert.ok(row.id == 1);
        
        // rows hidden in another connection
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
        
        await transaction.rollback();
        
        // rows still hidden in another connection, after rollback
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
    });

    it("working with transaction after rollback", async() => {
        let row, result;
        
        row = await transaction.query(`
            insert row into country default values
        `);
        
        assert.ok(row.id == 1);
        
        // rows hidden in another connection
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
        
        await transaction.rollback();
        
        // rows still hidden in another connection, after rollback
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);

        // we can run query, after rollback
        result =  await transaction.query("insert row into country default values");
        assert.ok(result.id == 2);

    });

});
