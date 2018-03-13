"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");

module.exports = function restoreTestServer(dump) {
    let server = dump;
    // just clone
    server = JSON.stringify(server);
    server = JSON.parse(server);
    
    for (let key in server.nodes) {
        let sql = server.nodes[ key ];
        let parsed = GrapeQLCoach.parseEntity(sql);
        
        server.nodes[ key ] = {
            parsed
        };
    }
    
    return server;
};