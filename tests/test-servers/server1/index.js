"use strict";

const config = require("./config");
const GrapeQL = require("../../../src/server/GrapeQL");
const DBMigrate = require("db-migrate");

const dumpTestServer = require("../../utils/dumpTestServer");

module.exports = async function init() {
    let dbmigrate = DBMigrate.getInstance(true, {
        cwd: __dirname + "/",
        env: "dev",
        config: {
            dev: {
                driver: "pg",
                user: config.db.user,
                database: config.db.database,
                password: config.db.password,
                host: config.db.host,
                port: config.db.port
            }
        }
    });

    await dbmigrate.up();
    
    let server = await GrapeQL.start(config);
    
    // for browser
    dumpTestServer(server, __dirname + "/server-dump.json");
    
    return server;
};
