"use strict";

const assert = require("assert");
const {stopServer, startServer, clearDatabase} = require("../../utils/serverHelpers");

let server;

before(startServer(
    __dirname,
    _server => {server = _server;}
));

after(stopServer(
    () => server
));

describe("SimpleInsert task", () => {
    
    it("insert row, check id", async() => {
        await clearDatabase(server.db, __dirname);
        
        let transaction = await server.transaction();
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
    });
    
    it("insert row, check id", async() => {
        await clearDatabase(server.db, __dirname);
        
        let transaction = await server.transaction();
        let rows;
        
        rows = await transaction.query(`
            insert into country (code) values ('ru')
            returning id, code
        `);
        
        assert.ok( rows[0].id == 1 );
        assert.ok( rows[0].code == "ru" );
    });
    
});
