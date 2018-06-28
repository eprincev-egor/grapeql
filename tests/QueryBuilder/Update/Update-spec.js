"use strict";

describe("Update", () => {
    const {testUpdate} = require("../../utils/init")(__dirname);
    
    testUpdate({
        node: `
            select * from country
        `,
        request: {
            set: {
                code: "ru"
            },
            where: ["id", "=", 1]
        },
        result: "update country set code = $tag1$ru$tag1$ where country.id = 1"
    });
});
