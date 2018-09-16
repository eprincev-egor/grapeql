"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../src/server/GrapeQL");
const {clearDatabase} = require("../utils/serverHelpers");
const config = require("../grapeql.config");

describe("Cache", () => {
    
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

    it("company orders count", async() => {
        await server.cache.create(`
            cache for company (
                select
                    count(*) as count
                from orders
                where
                    orders.id_client = company.id
            )
            after change orders set where
                orders.id_client = company.id
        `);

        let company = await server.query(`
            insert row into company
                (name, inn)
            values
                ('Test', '123')
        `);

        let order = await server.query(`
            insert row into orders
                (id_client)
            values
                ($client_id::integer)
        `, { $client_id: company.id });

        assert.deepEqual(company, {
            id: 1,
            name: "Test",
            inn: "123"
        });

        assert.deepEqual(order, {
            id: 1,
            id_client: 1
        });
    });
});
