"use strict";

module.exports = {
    db: {
        host: "localhost",
        user: "my-awesome-user-name",
        password: "my-awesome-password",
        port: 5432,
        database: "my-awesome-db-name"
    },
    workdir: "./workdir",
    workfiles: {
        cache: "*.sql",
        query: "*.sql",
        events: "*.events.js"
    }
};
