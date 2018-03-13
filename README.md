# GrapeQL
Simple client for your hard queries  

![CI status](https://circleci.com/gh/eprincev-egor/grapeql.svg?style=shield)

## Usage
```js

// server will loading db scheme and
// parse your queries
let server = await GrapeQL.start({
    // db connect settings
    db: {
        host: "localhost",
        user: "my-awesome-user-name",
        password: "my-awesome-password",
        port: 5432,
        database: "my-awesome-db-name"
    },
    // path to your sql files with queries
    nodes: "./nodes"
});

// using parsed node from Company.sql
let Company = server.nodes.Company;

// load data from db
let rows = await Company.get({
    columns: ["id", "inn", "name"],
    offset: 0,
    limit: 2
});

```
