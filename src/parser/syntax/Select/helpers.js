"use strict";

const PUBLIC_SCHEMA_NAME = "public";

function objectLink2schmeTable(objectLink) {
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

function objectLink2schmeTableColumn(objectLink) {
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
    link = objectLink2schmeTable( link );

    if ( !link.tableObject ) {
        throw new Error("invalid link");
    }

    let schema, table;

    if ( !link.schemaObject ) {
        schema = server.schemas[ PUBLIC_SCHEMA_NAME ];
        if ( !schema ) {
            throw new Error(`schema ${ PUBLIC_SCHEMA_NAME } does not exist`);
        }
    }
    else if ( link.schemaObject.content ) {
        let content = link.schemaObject.content;
        schema = server.schemas[ content ];
        if ( !schema ) {
            throw new Error(`schema ${ content } does not exist`);
        }
    }
    else if ( link.schemaObject.word ) {
        let word = link.schemaObject.word.toLowerCase();
        for (let name in server.schemas ) {
            if ( name.toLowerCase() == word ) {
                schema = server.schemas[ name ];
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
    let link = objectLink2schmeTableColumn( objectLink );

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
    PUBLIC_SCHEMA_NAME,
    objectLink2schmeTableColumn,
    objectLink2schmeTable,
    getDbTable,
    getDbColumn
};
