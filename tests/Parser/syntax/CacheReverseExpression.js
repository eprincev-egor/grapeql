"use strict";

module.exports = [
    {
        str: "after change public.order set where public.order.id_order = company.id",
        result: {
            table: {link: [
                {word: "public"},
                {word: "order"}
            ]},
            expression: {elements: [
                {link: [
                    {word: "public"},
                    {word: "order"},
                    {word: "id_order"}
                ]},
                {operator: "="},
                {link: [
                    {word: "company"},
                    {word: "id"}
                ]}
            ]}
        }
    }
];
