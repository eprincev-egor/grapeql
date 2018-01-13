"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
const QueryBuilder = require("./QueryBuilder");
const fs = require("fs");
const _ = require("lodash");

class Node {
    constructor(options, server) {
        if ( _.isString(options) ) {
            options = {file: options};
        }
        this.options = options;
        
        let fileBuffer = fs.readFileSync( options.file );
        let parsed = GrapeQLCoach.parseEntity( fileBuffer.toString() );
        this.parsed = parsed;
        
        this.server = server;
        this.queryBuilder = new QueryBuilder(server, this);
    }
    
    async get(request) {
        let query = this.queryBuilder.get(request);
        console.log( query.toString() );
        let result = await this.server.db.query( query.toString() );
        
        return result.rows;
    }
}

module.exports = Node;
