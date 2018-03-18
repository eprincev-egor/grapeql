"use strict";

const PUBLIC_SCHEME_NAME = "public";

function equalTableLink(leftLink, rightLink) {
    // scheme can be null
    let leftScheme = leftLink.schemeObject;
    if ( !leftScheme ) {
        leftScheme = {word: PUBLIC_SCHEME_NAME};
    }

    let rightScheme = rightLink.schemeObject;
    if ( !rightScheme ) {
        rightScheme = {word: PUBLIC_SCHEME_NAME};
    }

    return (
        _equalObject(leftScheme, rightScheme) &&

        leftLink.tableObject && rightLink.tableObject &&
        _equalObject(leftLink.tableObject, rightLink.tableObject)
    );
}

function _equalObject(left, right) {
    if ( left.content || right.content ) {
        return left.content === right.content;
    }

    return left.word.toLowerCase() == right.word.toLowerCase();
}

function objectLink2schmeTable(objectLink) {
    let scheme = objectLink.link[0];
    let table = objectLink.link[1];

    if ( !table ) {
        table = scheme;
        scheme = null;
    }

    let schemeObject = scheme;
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }

    let tableObject = table;
    if ( table ) {
        table = table.word || table.content;
    }

    return {table, scheme, tableObject, schemeObject};
}

function objectLink2schmeTableColumn(objectLink) {
    let scheme = objectLink.link[0];
    let table = objectLink.link[1];
    let column = objectLink.link[2];

    if ( !column ) {
        column = table;
        table = scheme;
        scheme = null;
    }

    if ( !column ) {
        column = table;
        table = null;
        scheme = null;
    }

    let schemeObject = scheme;
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }

    let tableObject = table;
    if ( table ) {
        table = table.word || table.content;
    }

    let columnObject = column;
    column = column.word || column.content;

    return {scheme, table, column, columnObject, tableObject, schemeObject};
}

function getDbTable(server, link) {
    if ( !link.tableObject ) {
        throw new Error("invalid link");
    }

    let scheme, table;

    if ( !link.schemeObject ) {
        scheme = server.schemes[ PUBLIC_SCHEME_NAME ];
        if ( !scheme ) {
            throw new Error(`scheme ${ PUBLIC_SCHEME_NAME } does not exist`);
        }
    }
    else if ( link.schemeObject.content ) {
        let content = link.schemeObject.content;
        scheme = server.schemes[ content ];
        if ( !scheme ) {
            throw new Error(`scheme ${ content } does not exist`);
        }
    }
    else if ( link.schemeObject.word ) {
        let word = link.schemeObject.word.toLowerCase();
        for (let name in server.schemes ) {
            if ( name.toLowerCase() == word ) {
                scheme = server.schemes[ name ];
                break;
            }
        }
        if ( !scheme ) {
            throw new Error(`scheme ${ word } does not exist`);
        }
    }

    if ( link.tableObject.content ) {
        let content = link.tableObject.content;
        table = scheme.tables[ content ];
        if ( !table ) {
            throw new Error(`table ${ content } does not exist`);
        }
    }
    else if ( link.tableObject.word ) {
        let word = link.tableObject.word.toLowerCase();
        for (let name in scheme.tables ) {
            if ( name.toLowerCase() == word ) {
                table = scheme.tables[ name ];
                break;
            }
        }
        if ( !table ) {
            throw new Error(`table ${ word } does not exist`);
        }
    }

    return table;
}

function getDbColumn(serverOrTable, link) {
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
    PUBLIC_SCHEME_NAME,
    equalTableLink,
    objectLink2schmeTable,
    objectLink2schmeTableColumn,
    getDbTable,
    getDbColumn
};
