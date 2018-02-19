"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
const Query = require("./Query");
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
    }
    
    async get(request) {
        let query = new Query({
            request,
            server: this.server,
            node: this
        });
        console.log( query.toString() );
        let result = await this.server.db.query( query.toString() );
        
        return result.rows;
    }
}

module.exports = Node;
