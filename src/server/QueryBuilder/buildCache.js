"use strict";

const Deps = require("../../parser/deps/Deps");

function buildCache({
    select,
    queryBuilder
}) {
    let server = queryBuilder.server;
    let deps = new Deps({
        select,
        server
    });

    console.log( deps );
}

module.exports = buildCache;