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
        
        let transaction = server.transaction();
        let row;
        
        row = await transaction.query(`
            insert into country default values
        `);
        
        assert.ok(row.id == 1);
        
        row = await transaction.query(`
            insert into country default values
        `);
        
        assert.ok(row.id == 2);
    });
    
    it("insert row, check id", async() => {
        await clearDatabase(server.db, __dirname);
        
        let transaction = server.transaction();
        let rows;
        
        rows = await transaction.query(`
            insert into country (code) values ('ru')
        `);
        
        assert.ok( rows[0].id == 1 );
        assert.ok( rows[0].code == "ru" );
    });
    
});
