"use strict";

class Plan {
    constructor({
        select, values, 
        server, withQuery,
        parentPlan
    }) {
        this.parentPlan = parentPlan;
        
        this.select = select;
        this.values = values;
        this.server = server;
        this.withQuery = withQuery;

        this.clear();
    }

    clear() {
        this.columns = [];
        this.columnByName = {};
        this.fromItems = [];
        this.necessaryLinks = [];
        this.selectedLinks = [];

        // select  ... where (select ...)
        this.necessarySubPlans = [];
    }

    build() {
        // redefine me
    }
}

module.exports = Plan;