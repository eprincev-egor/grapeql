"use strict";

const pg = require("pg");
const fs = require("fs");
const GrapeQL = require("../../src/server/GrapeQL");
const _ = require("lodash");
let config = require("../config");

function startServer(dirname, callback) {
    return async() => {

        config = _.cloneDeep(config);
        config.nodes = dirname + "/nodes";

        if ( !fs.existsSync(config.nodes) ) {
            config.nodes = false;
        }

        let db = new pg.Client( config.db );

        await db.connect();

        // clear db before run tests
        await clearDatabase(db, dirname);

        let server = await GrapeQL.start( config );

        callback(server);
    };
}

async function clearDatabase(db, dirname) {
    // clear db before run tests
    let result = await db.query(`
        select schema_name
        from information_schema.schemata
        where schema_owner <> 'postgres'
    `);

    let clearDbSql = "";
    result.rows.forEach(row => {
        clearDbSql += `
            drop schema ${ row.schema_name } cascade;
        `;
    });
    clearDbSql += `
        drop schema if exists public cascade;
        create schema public;
    `;

    await db.query( clearDbSql );

    // creating needed tables
    let sql = fs.readFileSync( dirname + "/up.sql" );
    await db.query( sql.toString() );

}

function stopServer(getServer) {
    return async() => {
        let server = getServer();
        await server.stop();
    };
}

module.exports = {stopServer, startServer, clearDatabase};
