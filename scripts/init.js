"use strict";

const fs = require("fs");

fs.writeFileSync("./tests/test-servers/server1/config.js", `
"use strict";

module.exports = {
    db: {
        host: "localhost",
        user: "ubuntu",
        password: "ubuntu",
        port: 5433,
        database: "grapeql-test"
    },
    nodes: __dirname + "/nodes"
};
`);
