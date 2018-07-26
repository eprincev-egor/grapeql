"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("WithAllCommands trigger", () => {
    
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

    it("with (insert...) insert", async() => {
        let triggersCalls = [];

        class TestInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        server.triggers.create(TestInsert);
        
        await server.query(`
            with
                inserted as (
                    insert into units 
                        (name)
                    values 
                        ('A'),
                        ('B'),
                        ('C')
                    returning name
                )
            
            insert into units 
                (name)
            
            select
                'Clone ' || inserted.name
            from inserted
        `);

        assert.equal(triggersCalls.length, 6);
        
        // inserted rows in with query, must be first in changes stack
        assert.equal(triggersCalls[0].name, "A");
        assert.equal(triggersCalls[1].name, "B");
        assert.equal(triggersCalls[2].name, "C");
    
        assert.equal(triggersCalls[3].name, "Clone A");
        assert.equal(triggersCalls[4].name, "Clone B");
        assert.equal(triggersCalls[5].name, "Clone C");

    });

    it("with (insert...), (insert...) insert", async() => {
        let triggersCalls = [];

        class TestInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        server.triggers.create(TestInsert);
        
        await server.query(`
            with
                inserted_1 as (
                    insert into units 
                        (name)
                    values 
                        ('A'),
                        ('B'),
                        ('C')
                    returning name
                ),
                inserted_2 as (
                    insert into units 
                        (name)
                    values 
                        ('1'),
                        ('2'),
                        ('3')
                    returning name
                )
            
            insert into units 
                (name)
            
            select
                inserted_1.name || ':' || inserted_2.name
            from inserted_1, inserted_2
        `);

        assert.equal(triggersCalls.length, 15);
        
        // inserted rows in with query, must be first in changes stack
        
        // inserted_1
        assert.equal(triggersCalls[0].name, "A");
        assert.equal(triggersCalls[1].name, "B");
        assert.equal(triggersCalls[2].name, "C");
        
        // inserted_2
        assert.equal(triggersCalls[3].name, "1");
        assert.equal(triggersCalls[4].name, "2");
        assert.equal(triggersCalls[5].name, "3");
        
        // main insert
        assert.equal(triggersCalls[6].name,  "A:1");
        assert.equal(triggersCalls[7].name,  "A:2");
        assert.equal(triggersCalls[8].name,  "A:3");
        assert.equal(triggersCalls[9].name,  "B:1");
        assert.equal(triggersCalls[10].name, "B:2");
        assert.equal(triggersCalls[11].name, "B:3");
        assert.equal(triggersCalls[12].name, "C:1");
        assert.equal(triggersCalls[13].name, "C:2");
        assert.equal(triggersCalls[14].name, "C:3");

    });

});
