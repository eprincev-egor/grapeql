"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("SimpleUpdate transaction", () => {
    
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

        await transaction.destroy();
        transaction = null;
    });


    it("update, check returning result", async() => {
        let rows, row;
        
        rows = await transaction.query(`
            insert into country (code) values ('ru'), ('en')
        `);
        
        assert.ok(rows[0].id == 1);
        assert.ok(rows[1].id == 2);
        
        // update row, returning object or null
        row = await transaction.query(`
            update row country set code = 'RUS' where id = 1
        `);
        
        assert.ok(row.id == 1);
        assert.ok(row.code == "RUS");

        row = await transaction.query(`
            update row country set code = 'NOT_FOUND' where id = 3
        `);
        
        assert.ok(row === null);


        // update rows, always returning array
        rows = await transaction.query(`
            update country set code = 'ENG' where id = 2
        `);

        assert.ok(rows[0].id == 2);
        assert.ok(rows[0].code == "ENG");


        rows = await transaction.query(`
            update country set code = 'NOT_FOUND' where id = 3
        `);

        assert.ok(rows instanceof Array);
        assert.ok(rows.length === 0);
    });
    
});
