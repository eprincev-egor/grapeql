"use strict";

const Filter = require("../../filter/Filter");
const Select = require("../../parser/syntax/Select/Select");
const buildColumns = require("./buildColumns");
const buildVars = require("./buildVars");
const buildOrderBy = require("./buildOrderBy");
const buildWhere = require("./buildWhere");
const buildFromFiles = require("./buildFromFiles");
const buildSqlModelByColumns = require("./buildSqlModelByColumns");

function buildIndexOf({
    queryBuilder, 
    queryNode, 
    request
}) {
    let 
        orderBy = request.orderBy,
        row = request.row,
        where = request.where,
        vars = request.vars;
    

    let select = queryNode.select.clone();

    buildVars({
        queryNode,
        select,
        vars
    });

    select.clearColumns();

    if ( !row ) {
        throw new Error("row must be are filter");
    }
    row = new Filter(row);
    let rowColumns = row.getColumns();

    buildColumns({
        select,
        columns: rowColumns,
        originalSelect: queryNode.select
    });

    select.addColumn("row_number() over() as grapeql_row_index");

    if ( orderBy ) {
        buildOrderBy({
            select,
            orderBy,
            originalSelect: queryNode.select
        });
    }

    if ( where ) {
        buildWhere({
            select,
            where,
            originalSelect: queryNode.select,
            queryNode,
            queryBuilder
        });
    }

    buildFromFiles({
        queryBuilder,
        queryNode,
        select 
    });

    let sqlModel = buildSqlModelByColumns({
        select,
        queryNode,
        queryBuilder,
        columns: rowColumns,
        originalSelect: queryNode.select
    });
    for (let key in sqlModel) {
        let elem = sqlModel[key];
        elem.sql = `query."${ key }"`;
    }
    let rowFilterSql = row.toSql(sqlModel);

    return new Select(`
            select
                query.grapeql_row_index as index
            from (${select}) as query
            where ${ rowFilterSql }
        `.trim());
}


module.exports = buildIndexOf;