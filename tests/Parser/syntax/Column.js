"use strict";

module.exports = [
    {
        str: "company.id as id",
        result: {
            expression: {
                elements: [
                    {link: [
                        {word: "company"},
                        {word: "id"}
                    ]}
                ]
            },
            as: { word: "id"}
        }
    },
    {
        str: "null as nulL1",
        result: {
            expression: {
                elements: [
                    {null: true}
                ]
            },
            as: { word: "nulL1"}
        }
    },
    {
        str: "*",
        result: {
            expression: {
                elements: [
                    {link: [
                        "*"
                    ]}
                ]
            }
        }
    }
];
