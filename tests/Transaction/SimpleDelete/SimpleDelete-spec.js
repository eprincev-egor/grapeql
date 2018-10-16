"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleDelete transaction", () => {
    
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


    it("delete row", async() => {
        let row, rows;
        
        await transaction.query(`
            insert into country (code) values ('ru'), ('en')
        `);
        
        row = await transaction.query(`
            delete from country
            where id = 1
            returning row id, code
        `);

        assert.ok(row.id == 1);
        assert.ok(row.code == "ru");

        row = await transaction.query(`
            delete row from country
            where id = 2
        `);

        assert.ok(row.id == 2);
        assert.ok(row.code == "en");



        rows = await transaction.query(`
            insert into country (code) values ('ru'), ('en')
        `);
        rows = await transaction.query(`
            delete from country
        `);

        assert.ok(rows.length === 2);
        
        assert.ok(rows[0].id == 3);
        assert.ok(rows[0].code == "ru");

        assert.ok(rows[1].id == 4);
        assert.ok(rows[1].code == "en");


        rows = await transaction.query(`
            delete from country
            where id = 5
        `);

        assert.ok(rows instanceof Array);
        assert.ok(rows.length === 0);
    });
    
});
