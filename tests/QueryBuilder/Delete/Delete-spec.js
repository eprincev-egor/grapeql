"use strict";

const {testDelete} = require("../../utils/init")(__dirname);

describe("Delete", () => {
    testDelete({
        node: `
            select * from country
        `,
        request: {},
        result: "delete from country"
    });

    testDelete({
        node: `
            select * from country
        `,
        request: {
            where: ["id", "=", 4]
        },
        result: "delete from country where id = 4"
    });

    testDelete({
        node: `
            select * from country
        `,
        request: {
            where: ["code", "=", "ru"]
        },
        result: "delete from country where code = $tag1$ru$tag1$"
    });

    testDelete({
        node: `
            select * from test.company
        `,
        request: {
            where: ["id", "=", 4]
        },
        result: "delete from test.company where id = 4"
    });
});
