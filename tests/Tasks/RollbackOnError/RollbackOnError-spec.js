"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("RollbackOnError", () => {
    
    let server;
    let transaction;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);

        // run server
        server = await GrapeQL.start( config );
        
        // begin transaction
        transaction = await server.transaction();
    });

    afterEach(async() => {
        if ( !server ) {
            return;
        }

        await server.stop();
        server = null;

        if ( !transaction ) {
            return;
        }

        await transaction.destroy();
        transaction = null;
    });


    it("insert and commit", async() => {
        let row, result;
        
        row = await transaction.query(`
            insert row into country default values
        `);
        
        assert.ok(row.id == 1);
        
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
        
        await transaction.commit();
        
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
        
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
        
        await transaction.rollback();
        
        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);
    });
    
});
