"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");

class Node {
    constructor({server, sql, file}) {
        this.server = server;
        this.parsed = GrapeQLCoach.parseEntity(sql);
        this.file = file;
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
