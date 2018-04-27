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

        let sql = fs.readFileSync( dirname + "/up.sql" );
        await db.query( sql.toString() );

        let server = await GrapeQL.start( config );

        callback(server);
    };
}

function stopServer(getServer) {
    return async() => {
        let server = getServer();
        await server.stop();
    };
}

module.exports = {stopServer, startServer};
