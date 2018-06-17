"use strict";

module.exports = [
    {
        str: "declare $name text;",
        result: {
            variables: {
                name: {
                    name: {name: "name"},
                    type: {type: "text"}
                }
            },
            variablesArr: [
                {
                    name: {name: "name"},
                    type: {type: "text"}
                }
            ]
        }
    },
    {
        str: "declare $is_some boolean default false not null;",
        result: {
            variables: {
                is_some: {
                    name: {name: "is_some"},
                    type: {type: "boolean"},
                    default: {elements: [
                        {boolean: false}
                    ]},
                    notNull: true
                }
            },
            variablesArr: [
                {
                    name: {name: "is_some"},
                    type: {type: "boolean"},
                    default: {elements: [
                        {boolean: false}
                    ]},
                    notNull: true
                }
            ]
        }
    },
    {
        str: "declare $name text; $id_order integer;",
        result: {
            variables: {
                name: {
                    name: {name: "name"},
                    type: {type: "text"}
                },
                id_order: {
                    name: {name: "id_order"},
                    type: {type: "integer"}
                }
            },
            variablesArr: [
                {
                    name: {name: "name"},
                    type: {type: "text"}
                },
                {
                    name: {name: "id_order"},
                    type: {type: "integer"}
                }
            ]
        }
    }
];
