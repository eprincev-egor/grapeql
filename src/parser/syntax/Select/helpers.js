"use strict";

const PUBLIC_SCHEME_NAME = "public";

function equalTableLink(leftLink, rightLink) {
    return (
        // scheme can be null
        leftLink.scheme == rightLink.scheme &&
        leftLink.table == rightLink.table
    );
}

function objectLink2schmeTable(objectLink) {
    let scheme = objectLink.link[0];
    let table = objectLink.link[1];
    
    if ( !table ) {
        table = scheme;
        scheme = null;
    }
    
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }
    
    if ( table ) {
        table = table.word || table.content;
    }
    
    return {table, scheme};
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
    
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }
    
    if ( table ) {
        table = table.word || table.content;
    }
    
    let columnObject = column;
    column = column.word || column.content;
    
    return {scheme, table, column, columnObject};
}

module.exports = {
    PUBLIC_SCHEME_NAME,
    equalTableLink, 
    objectLink2schmeTable, 
    objectLink2schmeTableColumn
};
