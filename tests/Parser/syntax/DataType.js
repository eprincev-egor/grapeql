"use strict";

module.exports = [
    {
        str: "Timestamp",
        result: {type: "timestamp"}
    },
    {
        str: "numeric  ( 10 )",
        result: {type: "numeric(10)"}
    },
    {
        str: "numeric ( 10, 3 )",
        result: {type: "numeric(10,3)"}
    },
    {
        str: "bigint[ ]",
        result: {
            type: "bigint[]"
        }
    },
    {
        str: "bigint [ 1 ]",
        result: {
            type: "bigint[1]"
        }
    },
    {
        str: "char",
        error: Error
    }
];
