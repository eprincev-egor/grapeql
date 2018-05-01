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

        if ( options.file ) {
            let fileBuffer = fs.readFileSync( options.file );
            let parsed = GrapeQLCoach.parseEntity( fileBuffer.toString() );
            this.parsed = parsed;
        }
        else if ( options.sql ) {
            let parsed = GrapeQLCoach.parseEntity( options.sql );
            this.parsed = parsed;
        }
        else if ( options.parsed ) {
            this.parsed = options.parsed;
        }

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
