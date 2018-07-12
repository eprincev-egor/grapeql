"use strict";

const buildColumnExpression = require("./buildColumnExpression");

function buildOrderBy({
    select, orderBy,
    originalSelect
}) {
    if ( typeof orderBy == "string" ) {
        orderBy = [orderBy];
    }

    if ( !orderBy.length ) {
        throw new Error("orderBy must be array like are ['id', 'desc'] or [['name', 'asc'], ['id', 'desc']]");
    }

    if ( typeof orderBy[0] == "string" ) {
        orderBy = [orderBy];
    }

    for (let n = orderBy.length, i = n - 1; i >= 0; i--) {
        let elem = orderBy[i];
        let key = elem[0];
        let vector = elem[1] || "asc";

        if ( typeof key != "string" ) {
            throw new Error("invalid orderBy key");
        }
        if ( typeof vector != "string" ) {
            throw new Error("invalid orderBy vector");
        }

        vector = vector.toLowerCase();
        if ( vector != "asc" && vector != "desc" ) {
            throw new Error("invalid orderBy vector: " + vector);
        }

        let expression = buildColumnExpression({originalSelect, key});
        select.unshiftOrderByElement(`${ expression } ${ vector }`);
    }
}

module.exports = buildOrderBy;