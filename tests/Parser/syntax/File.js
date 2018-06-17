"use strict";

module.exports = [
    {
        str: "file Order",
        result: {
            path: [
                {name: "."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "./Order",
        result: {
            path: [
                {name: "."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "../Order",
        result: {
            path: [
                {name: ".."},
                {name: "Order"}
            ]
        }
    },
    {
        str: "file Order.sql",
        result: {
            path: [
                {name: "."},
                {name: "Order.sql"}
            ]
        }
    },
    {
        str: "file \" nice \"",
        result: {
            path: [
                {name: "."},
                {content: " nice "}
            ]
        }
    },
    {
        str: "file some / file on",
        result: {
            path: [
                {name: "."},
                {name: "some"},
                {name: "file"}
            ]
        }
    },
    {
        str: "file /root.sql",
        result: {
            path: [
                {name: "root.sql"}
            ]
        }
    },
    {
        str: "/root.sql",
        result: {
            path: [
                {name: "root.sql"}
            ]
        }
    },
    {
        str: "file ./company",
        result: {
            path: [
                {name: "."},
                {name: "company"}
            ]
        }
    },
    {
        str: "./Country)",
        result: {
            path: [
                {name: "."},
                {name: "Country"}
            ]
        }
    }
];
