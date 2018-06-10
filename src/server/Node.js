"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
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
        let server = this.server;
        let query = this.parsed.buildSelect({
            server,
            node: this,

            columns: request.columns,
            where: request.where,
            orderBy: request.orderBy,
            offset: request.offset,
            limit: request.limit
        });
        let result = await server.db.query( query.toString() );

        return result.rows;
    }

    async getCount(request) {
        let server = this.server;
        let query = this.parsed.buildCount({
            server,
            node: this,
            where: request.where
        });
        let result = await server.db.query( query.toString() );

        if ( result.rows && result.rows.length ) {
            return +result.rows[0].count || 0;
        } else {
            return 0;
        }
    }
}

module.exports = Node;
