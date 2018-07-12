"use strict";

const buildVars = require("./buildVars");
const buildWhere = require("./buildWhere");
const buildFromFiles = require("./buildFromFiles");

function buildCount({
    queryManager, 
    queryNode, 
    request
}) {
    let where = request.where;
    let vars = request.vars;

    let select = queryNode.select.clone();

    buildVars({
        queryNode,
        select,
        vars
    });

    select.clearColumns();
    select.addColumn("count(*) as count");

    if ( select.orderBy ) {
        select.orderBy.forEach(elem => {
            select.removeChild(elem);
        });
        delete select.orderBy;
    }


    if ( where ) {
        buildWhere({
            select,
            where,
            originalSelect: queryNode.select,
            queryNode,
            queryManager
        });
    }

    buildFromFiles({ 
        queryManager, 
        select,
        queryNode
    });

    return select;
}

module.exports = buildCount;