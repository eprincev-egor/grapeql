"use strict";

const fs = require("fs");

fs.writeFileSync("./tests/grapeql.config.js", `
"use strict";

module.exports = {
    db: {
        host: "localhost",
        user: "ubuntu",
        password: "ubuntu",
        port: 5432,
        database: "grapeql-test"
    }
};
`);
