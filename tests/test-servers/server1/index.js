"use strict";

const config = require("./config");
const GrapeQL = require("../../../src/server/GrapeQL");
const DBMigrate = require("db-migrate");
const fs = require("fs");

let server;
module.exports = async function init() {
    if ( server ) {
        return server;
    }
    
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
    
    server = await GrapeQL.start(config);
    
    let serverJSON = JSON.stringify({schemes: server.schemes}, null, 4);
    fs.writeFileSync(__dirname + "/server-dump.json", serverJSON);
    
    return server;
};
