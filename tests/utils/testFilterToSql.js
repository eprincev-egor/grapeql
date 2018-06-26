"use strict";

const assert = require("assert");

const Filter = require("../../src/filter/Filter");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testFilterToSql(fromFilter, sql, model) {
    it(JSON.stringify(fromFilter) + " => `" + sql + "`", () => {
        let parsedSql = new GrapeQLCoach(sql);
        parsedSql.skipSpace();
        parsedSql = parsedSql.parseExpression();

        let filter = new Filter(fromFilter);
        let filterSql = filter.toSql( model );
        let parsedFilterSql = new GrapeQLCoach( filterSql );

        parsedFilterSql.skipSpace();
        parsedFilterSql = parsedFilterSql.parseExpression();

        let isEqual = !!weakDeepEqual(parsedSql, parsedFilterSql);

        assert.ok(isEqual);
    });
}

module.exports = testFilterToSql;
