"use strict";

const buildOrderBy = require("./buildOrderBy");
const buildVars = require("./buildVars");
const buildWhere = require("./buildWhere");
const buildFromFiles = require("./buildFromFiles");
const buildColumns = require("./buildColumns");

function buildSelect({
    queryBuilder,
    queryNode,
    request
}) {
    let
        columns = request.columns,
        where = request.where,
        orderBy = request.orderBy,
        offset = request.offset,
        limit = request.limit,
        vars = request.vars;

    if ( !Array.isArray(columns) || !columns.length ) {
        throw new Error("columns must be not empty array");
    }

    let select = queryNode.select.clone();

    buildVars({
        queryNode,
        select,
        vars
    });

    buildColumns({
        select,
        columns,
        originalSelect: queryNode.select
    });

    if ( where ) {
        buildWhere({
            select,
            where,
            originalSelect: queryNode.select,
            queryBuilder,
            queryNode
        });
    }

    if ( orderBy ) {
        buildOrderBy({
            select,
            orderBy,
            originalSelect: queryNode.select
        });
    }

    buildFromFiles({ queryBuilder, queryNode, select });

    if ( limit != null && limit != "all" ) {
        select.setLimit(limit);
    }

    if ( offset != null && offset > 0 ) {
        select.setOffset(offset);
    }

    return select;
}

module.exports = buildSelect;