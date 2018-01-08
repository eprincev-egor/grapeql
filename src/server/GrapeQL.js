"use strict";

const _ = require("lodash");
const pg = require("pg");
const client = 

class GrapeQL {
    constructor(settings) {
        this.settings = settings;
        this.initDB();
        this.loadTables();
    }
    
    loadTables() {
        
    }
}

GrapeQL.start = async function(settings) {
    let server = new GrapeQL(settings);
    await server.start();
    return server;
};

module.exports = GrapeQL;
