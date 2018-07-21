"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleInsert transaction", () => {
    
    let server;
    let transaction;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);

        // run server
        config.http = false;
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

        await transaction.end();
        transaction = null;
    });


    it("insert default values, check id", async() => {
        let rows;
        
        rows = await transaction.query(`
            insert into country default values
            returning id
        `);
        
        assert.ok(rows[0].id == 1);
        
        rows = await transaction.query(`
            insert into country default values
            returning id
        `);
        
        assert.ok(rows[0].id == 2);

        rows = await transaction.query(`
            insert into country default values
            returning *
        `);
        
        assert.ok(rows[0].id == 3);

        // returning all columns by default behavior
        rows = await transaction.query(`
            insert into country default values
        `);
        
        assert.ok(rows[0].id == 4);
    });
    
    it("insert values, check id", async() => {
        let rows;
        
        rows = await transaction.query(`
            insert into country (code) values ('ru')
            returning id, code
        `);
        
        assert.ok( rows[0].id == 1 );
        assert.ok( rows[0].code == "ru" );
    });
    
    it("insert row into, returning row", async() => {
        let row;
        
        row = await transaction.query(`
            insert row into country default values
            returning id
        `);
        
        assert.ok(row.id == 1);
    });
    
});
