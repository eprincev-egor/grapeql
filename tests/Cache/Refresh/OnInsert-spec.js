"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("Cache/Refresh/OnInsert", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);
        await db.end();

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
        let cacheRow;

        await server.cache.create(`
            cache for company (
                select
                    count(*) as orders_count
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

        assert.deepEqual(company, {
            id: 1,
            name: "Test",
            inn: "123"
        });



        cacheRow = await server.query(`
            select row *
            from gql_cache.company
            where id = 1
        `);

        assert.deepEqual(cacheRow, {
            id: 1,
            orders_count: 0
        });



        let order = await server.query(`
            insert row into orders
                (id_client)
            values
                ($client_id::integer)
        `, { $client_id: company.id });

        assert.deepEqual(order, {
            id: 1,
            id_client: 1
        });

        
        cacheRow = await server.query(`
            select row *
            from gql_cache.company
            where id = 1
        `);

        assert.deepEqual(cacheRow, {
            id: 1,
            orders_count: 1
        });

    });
});
