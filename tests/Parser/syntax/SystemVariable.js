"use strict";

module.exports = [
    {
        str: "$x",
        result: {name: "x"}
    },
    {
        str: "$X",
        result: {name: "X"}
    },
    {
        str: "$_",
        result: {name: "_"}
    },
    {
        str: "$x1",
        result: {name: "x1"}
    },
    {
        str: "$Ёё",
        result: {name: "Ёё"}
    },
    {
        // forbidden symbol $ in variable name
        str: "$$Any_Variable",
        error: Error
    },
    {
        str: "$Привет",
        result: {name: "Привет"}
    },
    {
        str: "$",
        error: Error
    }
];
