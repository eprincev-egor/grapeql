"use strict";

module.exports = [
    {
        str: "$name text",
        result: {
            name: {name: "name"},
            type: {
                type: "text"
            }
        }
    },
    {
        str: "$name text not null",
        result: {
            name: {name: "name"},
            type: {
                type: "text"
            },
            notNull: true
        }
    },
    {
        str: "$name boolean not null default true",
        result: {
            name: {name: "name"},
            type: {
                type: "boolean"
            },
            notNull: true,
            default: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "$name boolean default false",
        result: {
            name: {name: "name"},
            type: {
                type: "boolean"
            },
            default: {elements: [
                {boolean: false}
            ]}
        }
    },
    {
        str: "$price numeric(10, 2) not null default 0 check( price>= 0)",
        result: {
            name: {name: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    },
    {
        str: "$price numeric(10, 2) default 0 not null check( price>= 0)",
        result: {
            name: {name: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    },
    {
        str: "$price numeric(10, 2) default 0 check( price>= 0) not null",
        result: {
            name: {name: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    }
];
