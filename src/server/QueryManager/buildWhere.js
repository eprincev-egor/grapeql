"use strict";

const Filter = require("../../filter/Filter");
const buildSqlModelByColumns = require("./buildSqlModelByColumns");

function buildWhere({
    select,
    where, originalSelect,
    queryManager,
    queryNode
}) {
    where = new Filter(where);

    let columns = where.getColumns();
    let sqlModel = buildSqlModelByColumns({
        queryManager,
        queryNode,
        columns,
        originalSelect
    });

    let whereSql = where.toSql( sqlModel );
    select.addWhere( whereSql );
}

module.exports = buildWhere;