"use strict";

const PUBLIC_SCHEMA_NAME = "public";

const numberTypes = [
    "smallint",
    "integer",
    "bigint",
    "decimal",
    "real",
    "double precision",
    "smallserial",
    "serial",
    "bigserial",
    "int",
    "numeric"
];
let isSqlNumber = function(type) {
    if ( numberTypes.includes(type.toLowerCase()) ) {
        return true;
    }

    if ( /^numeric\s*\(\s*\d+\s*(\s*,\s*\d+\s*)?\)\s*$/i.test(type) ) {
        return true;
    }

    return false;
};

// 42
// 3.5
// 4.
// .001
// 5e2
// 1.925e-3
// 12345565556677889453645645645645645    js not support big numbers
// is not NaN, but can be Infinity, and is not null and is not [0]
let isLikeNumber = function(value) {
    if ( +value !== +value ) {
        return false;
    }

    if ( typeof value == "object" ) {
        return false;
    }

    return true;
};



const textTypes = [
    "text",
    "\"char\""
];
let isSqlText = function(type) {
    if ( textTypes.includes(type.toLowerCase()) ) {
        return true;
    }

    // "character varying(n)",
    // "varchar(n)",
    // "character(n)",
    // "char(n)",
    if ( /^\s*character\s+varying\s*\(\s*\d+\s*\)\s*$|^\s*varchar\s*\(\s*\d+\s*\)\s*$|^\s*character\s*\(\s*\d+\s*\)\s*$|^\s*char\s*\(\s*\d+\s*\)\s*$/i.test( type ) ) {
        return true;
    }

    return false;
};

let isLikeText = function(value) {
    switch (typeof value) {
    case "number":
        return true;
    case "string":
        return true;
    }
    return false;
};

let wrapText = function(text) {
    text += "";
    let tag = "tag";
    let index = 1;
    while ( text.indexOf("$tag" + index + "$") != -1 ) {
        index++;
    }
    tag += index;

    return `$${tag}$${ text }$${tag}$`;
};



const dateTypes = [
    "date",
    "timestamp"
];
let isSqlDate = function(type) {
    if ( dateTypes.includes(type.toLowerCase()) ) {
        return true;
    }

    // timestamp without time zone
    // timestamp with time zone
    if ( /^\s*timestamp\s+(with|without)\s+time\s+zone$/i.test(type) ) {
        return true;
    }

    return false;
};

let isLikeDate = function(value) {
    if ( value && value.toISOString ) {
        return true;
    }

    // unix timestamp
    if ( typeof value == "number" ) {
        return true;
    }

    return false;
};

let wrapDate = function(value, toType) {
    if ( typeof value == "number" ) {
        value = new Date(value);
    }

    if ( value && value.toISOString ) {
        return `'${ value.toISOString() }'::${ toType }`;
    }
};

let isSqlBoolean = function(type) {
    return type == "boolean";
};

let isLikeBoolean = function(value) {
    return (
        value === true  ||
        value === false ||
        value === 1     ||
        value === 0
    );
};

let value2sql = function(type, value) {
    if ( value == null ) {
        return "null";
    }

    if ( isSqlNumber(type) ) {

        if ( isLikeNumber(value)  ) {
            return "" + value;
        } else {
            throw new Error("invalid value for number: " + value);
        }
    }

    else if ( isSqlText(type) ) {
        if ( isLikeText(value) ) {
            return wrapText(value);
        } else {
            throw new Error("invalid value for text: " + value);
        }
    }

    else if ( isSqlDate(type) ) {
        if ( isLikeDate(value) ) {
            return wrapDate(value, type);
        } else {
            throw new Error("invalid value for date: " + value);
        }
    }

    else if ( isSqlBoolean(type) ) {
        if ( isLikeBoolean(value) ) {
            if ( value ) {
                return "true";
            } else {
                return "false";
            }
        } else {
            throw new Error("invalid value for boolean: " + value);
        }
    }

    else {
        throw new Error(`unrecognized type "${ type }`);
    }
};


function objectLink2schemaTable(objectLink) {
    let schema = objectLink.link[0];
    let table = objectLink.link[1];

    if ( !table ) {
        table = schema;
        schema = null;
    }

    let schemaObject = schema;
    if ( schema ) {
        schema = schema.word || schema.content;
    }

    let tableObject = table;
    if ( table ) {
        table = table.word || table.content;
    }

    return {table, schema, tableObject, schemaObject};
}

function objectLink2schemaTableColumn(objectLink) {
    let schema = objectLink.link[0];
    let table = objectLink.link[1];
    let column = objectLink.link[2];

    if ( !column ) {
        column = table;
        table = schema;
        schema = null;
    }

    if ( !column ) {
        column = table;
        table = null;
        schema = null;
    }

    let schemaObject = schema;
    if ( schema ) {
        schema = schema.word || schema.content;
    }

    let tableObject = table;
    if ( table ) {
        table = table.word || table.content;
    }

    let columnObject = column;
    column = column.word || column.content;

    return {schema, table, column, columnObject, tableObject, schemaObject};
}

function getDbTable(server, link) {
    link = objectLink2schemaTable( link );

    if ( !link.tableObject ) {
        throw new Error("invalid link");
    }

    let schema, table;

    if ( !link.schemaObject ) {
        schema = server.database.schemas[ PUBLIC_SCHEMA_NAME ];
        if ( !schema ) {
            throw new Error(`schema ${ PUBLIC_SCHEMA_NAME } does not exist`);
        }
    }
    else if ( link.schemaObject.content ) {
        let content = link.schemaObject.content;
        schema = server.database.schemas[ content ];
        if ( !schema ) {
            throw new Error(`schema ${ content } does not exist`);
        }
    }
    else if ( link.schemaObject.word ) {
        let word = link.schemaObject.word.toLowerCase();
        for (let name in server.database.schemas ) {
            if ( name.toLowerCase() == word ) {
                schema = server.database.schemas[ name ];
                break;
            }
        }
        if ( !schema ) {
            throw new Error(`schema ${ word } does not exist`);
        }
    }

    if ( link.tableObject.content ) {
        let content = link.tableObject.content;
        table = schema.tables[ content ];
        if ( !table ) {
            throw new Error(`table ${ content } does not exist`);
        }
    }
    else if ( link.tableObject.word ) {
        let word = link.tableObject.word.toLowerCase();
        for (let name in schema.tables ) {
            if ( name.toLowerCase() == word ) {
                table = schema.tables[ name ];
                break;
            }
        }
        if ( !table ) {
            throw new Error(`table ${ word } does not exist`);
        }
    }

    return table;
}

function getDbColumn(serverOrTable, objectLink) {
    let link = objectLink2schemaTableColumn( objectLink );

    if ( !link.columnObject ) {
        throw new Error("invalid link");
    }

    let table;
    if ( serverOrTable.columns ) {
        table = serverOrTable;
    } else {
        table = getDbTable(serverOrTable, link);
    }

    let column;

    if ( link.columnObject.content ) {
        let content = link.columnObject.content;
        column = table.columns[ content ];
        if ( !column ) {
            throw new Error(`column ${ content } does not exist`);
        }
    }
    else if ( link.columnObject.word ) {
        let word = link.columnObject.word.toLowerCase();
        for (let name in table.columns ) {
            if ( name.toLowerCase() == word ) {
                column = table.columns[ name ];
                break;
            }
        }
        if ( !column ) {
            throw new Error(`column ${ word } does not exist`);
        }
    }

    return column;
}


module.exports = {
    isSqlNumber,
    isLikeNumber,
    isSqlText,
    isLikeText,
    isSqlDate,
    isLikeDate,
    wrapText,
    wrapDate,
    isSqlBoolean,
    isLikeBoolean,
    value2sql,

    PUBLIC_SCHEMA_NAME,
    objectLink2schemaTableColumn,
    objectLink2schemaTable,
    getDbTable,
    getDbColumn
};
