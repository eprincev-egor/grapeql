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
        str: "$$Any_Variable",
        result: {name: "$Any_Variable"}
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
