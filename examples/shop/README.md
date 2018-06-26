# Install
make file grapeql.config.js 
```js
"use strict";

module.exports = {
    db: {
        host: "localhost",
        user: "my-awesome-user-name",
        password: "my-awesome-password",
        port: 5432,
        database: "my-awesome-db-name"
    }
};

```

run command for migrations  
```
$ node install.js
```

# Run  
run command for run server
```
$ node index.js
````
