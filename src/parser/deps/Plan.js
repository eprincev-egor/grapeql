"use strict";

class Plan {
    constructor({select, values, server, withQuery}) {
        this.select = select;
        this.values = values;
        this.server = server;
        this.withQuery = withQuery;

        this.columns = [];
        this.columnByName = {};
        this.fromItems = [];
        this.necessaryLinks = [];
        this.selectedLinks = [];
    }

    build() {
    }
}

module.exports = Plan;