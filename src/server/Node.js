"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");

class Node {
    constructor({server, sql, file, name}) {
        this.server = server;
        this.parsed = GrapeQLCoach.parseEntity(sql);
        this.file = file;
        this.name = name;

        if ( this.server.express ) {
            this.initRoutes();
        }
    }

    initRoutes() {
        let routes = {
            "select": this.select,
            "selectCount": this.selectCount
        };

        for (let key in routes) {
            let routePath = `/${this.name}/${key}`;
            let method = routes[ key ];

            this._buildGet(routePath, method);
            this._buildPost(routePath, method);
        }
    }

    _buildGet(routePath, method) {
        this.server.express.get(routePath, async(req, res) => {
            let result;

            try {
                result = await method.call(this, req.query);
            } catch(err) {
                result = {
                    error: err.message
                };
            }

            res.send(result);
        });
    }

    _buildPost(routePath, method) {
        this.server.express.post(routePath, async(req, res) => {
            let result;

            try {
                result = await method.call(this, req.body);
            } catch(err) {
                result = {
                    error: err.message
                };
            }

            res.send(result);
        });
    }

    async select(request) {
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

    async selectCount(request) {
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
