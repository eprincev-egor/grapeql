"use strict";

const _ = require("lodash");
const Filter = require("../filter/Filter");

class Query {
    constructor(params) {
        this.request = params.request;
        this.server = params.server;
        this.node = params.node;

        this.preapareRequest();
        this.build();
    }

    preapareRequest() {
        let request = this.request;
        let offset = 0;
        let limit = "all";

        if ( "offset" in request ) {
            offset = +request.offset;

            if ( offset < 0 ) {
                throw new Error("offset must by positive number: " + request.offset);
            }
        }

        if ( "limit" in request ) {
            limit = request.limit;

            if ( limit != "all" ) {
                limit = +request.limit;

                if ( limit < 0 ) {
                    throw new Error("limit must be 'all' or positive number: " + request.limit);
                }
            }
        }

        let columns = [];
        if ( Array.isArray(request.columns) ) {
            columns = request.columns;
        }
        columns.forEach(column => {
            if ( !_.isString(column) ) {
                throw new Error("column must be string: " + column);
            }
        });
        if ( !columns.length ) {
            throw new Error("columns must be array of strings: " + request.columns);
        }

        let where = false;
        if ( request.where ) {
            where = new Filter( request.where );
        }

        let orderBy = false;
        if ( request.orderBy ) {
            orderBy = request.orderBy;
        }

        this.request = {
            offset,
            limit,
            columns,
            where,
            orderBy
        };
    }

    build() {
        let request = this.request;
        this.select = this.node.parsed.build({
            server: this.server,
            node: this.node,
            columns: request.columns,
            limit: request.limit,
            offset: request.offset,
            where: request.where,
            orderBy: request.orderBy
        });
    }

    toString() {
        return this.select.toString();
    }
}

// need for tests
if ( typeof window !== "undefined" ) {
    if ( typeof window.tests !== "undefined" ) {
        window.tests.Query = Query;
    }
}

module.exports = Query;
