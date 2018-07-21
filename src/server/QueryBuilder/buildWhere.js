"use strict";

const Filter = require("../../filter/Filter");
const buildSqlModelByColumns = require("./buildSqlModelByColumns");

function buildWhere({
    select,
    where, originalSelect,
    queryBuilder,
    queryNode
}) {
    where = new Filter(where);

    let columns = where.getColumns();
    let sqlModel = buildSqlModelByColumns({
        queryBuilder,
        queryNode,
        columns,
        originalSelect
    });

    let whereSql = where.toSql( sqlModel );
    select.addWhere( whereSql );
}

module.exports = buildWhere;