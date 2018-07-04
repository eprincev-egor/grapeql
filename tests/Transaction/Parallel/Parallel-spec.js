"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("Parallel transaction", () => {
    
    let server;
    let transaction1;
    let transaction2;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);

        // run server
        config.http = false;
        server = await GrapeQL.start( config );
        
        // begin transaction
        transaction1 = await server.transaction();
        transaction2 = await server.transaction();
    });

    afterEach(async() => {
        if ( !server ) {
            return;
        }

        await server.stop();
        server = null;

        if ( transaction1 ) {
            try {
                await transaction1.destroy();
            } catch(err) {
                console.log(err);
            }
            transaction1 = null;
        }

        
        if ( transaction2 ) {
            try {
                await transaction2.destroy();
            } catch(err) {
                console.log(err);
            }
            transaction2 = null;
        }
    });


    it("two parallel transactions", async() => {
        let result;
        let row1, row2;

        row1 = await transaction1.query(`
            insert row into country (code) values ('ru')
        `);

        row2 = await transaction2.query(`
            insert row into country (code) values ('en')
        `);

        assert.ok(row1.id == 1);
        assert.ok(row1.code == "ru");
        assert.ok(row2.id == 2);
        assert.ok(row2.code == "en");

        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 0);

        await transaction1.rollback();
        await transaction2.commit();

        result = await server.db.query("select * from country");
        assert.ok(result.rows.length === 1);
        assert.ok(result.rows[0].id === 2);
        assert.ok(result.rows[0].code === "en");
    });

    it("parallel run query in transactions", async() => {
        let promise1, promise2;
        let rows;
        let row1, row2;

        promise1 = transaction1.query(`
            insert row into country (code) values ('ru')
        `);

        promise2 = transaction1.query(`
            insert row into country (code) values ('en')
        `);

        rows = await Promise.all([
            promise1,
            promise2
        ]);

        assert.ok(rows.length === 2);
        row1 = rows[0];
        row2 = rows[1];

        // in parallel, order of execution can be any
        assert.ok(
            row1.id == 1 &&
            row1.code == "ru"
            ||
            row2.id == 1 &&
            row2.code == "ru"
        );
        assert.ok(
            row1.id == 2 &&
            row1.code == "en"
            ||
            row2.id == 2 &&
            row2.code == "en"
        );
    });

});
