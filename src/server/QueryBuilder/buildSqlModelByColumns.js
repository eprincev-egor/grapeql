"use strict";

const buildColumnExpression = require("./buildColumnExpression");

function buildSqlModelByColumns({
    queryBuilder,
    queryNode,
    columns,
    originalSelect
}) {
    let sqlModel = {};

    columns.forEach(key => {
        if ( key in sqlModel ) {
            return;
        }

        let expression = buildColumnExpression({
            key,
            originalSelect
        });

        let type = originalSelect.getExpressionType({
            expression,
            node: queryNode,
            server: queryBuilder.server
        });

        sqlModel[ key ] = {
            sql: expression,
            type
        };
    });

    return sqlModel;
}

module.exports = buildSqlModelByColumns;