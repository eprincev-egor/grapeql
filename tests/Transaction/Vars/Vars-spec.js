"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("Vars in transaction", () => {
    
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


    it("simple integer", async() => {
        let row;
        
        row = await transaction.query(`
            insert row into country (code, population) 
            values ('ru', $population::integer)
        `, {
                $population: 150000000
            });
        
        assert.ok(row.id == 1);
        assert.ok(row.code == "ru");
        assert.ok(row.population === 150000000);

        await transaction.rollback();

        row = await transaction.query(`
            insert row into country (code, population) 
            values ('ru', $population::integer)
        `, {
                population: 150000000
            });
        
        assert.ok(row.id == 2);
        assert.ok(row.code == "ru");
        assert.ok(row.population === 150000000);
    });
    
});
