"use strict";

const fs = require("fs");

module.exports = function dumpTestServer(server, file) {
    
    let dump = {
        schemes: server.schemes,
        nodes: {}
    };
    
    for (let key in server.nodes) {
        let node = server.nodes[ key ];
        
        dump.nodes[ key ] = node.parsed.toString();
    }
    
    fs.writeFileSync(
        file, 
        JSON.stringify(dump)
    );
};