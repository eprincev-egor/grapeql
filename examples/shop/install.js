"use strict";

const pg = require("pg");
const {clearDatabase} = require("../../tests/utils/serverHelpers");
const config = require("./grapeql.config");

async function install() {
    let db = new pg.Client( config.db );
    await db.connect();
    await clearDatabase(db, __dirname);
    await db.end();
    console.log("success");
}


install();
