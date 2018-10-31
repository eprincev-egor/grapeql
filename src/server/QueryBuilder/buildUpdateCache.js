"use strict";

const {value2sql} = require("../../helpers");

function buildUpdateCache({
    // array of changes (insert/update/delete)
    changesArr,
    cache
}) {
    changesArr = changesArr.filter(changes =>
        changes.table != cache.syntax.table.getDbTableLowerPath()
    );

    if ( !changesArr.length ) {
        return;
    }



    let tables = [];
    let rowsByTable = {};
    let reverseQueryByTable = {};

    changesArr.forEach(changes => {
        let {type, table, row, prev} = changes;
        
        let rows = rowsByTable[ table ];

        if ( !tables.includes(table) ) {
            tables.push(table);

            rows = [];
            rowsByTable[ table ] = rows;


            let reverseQuery = cache.syntax.reverse.find(reverseQuery => 
                reverseQuery.table.getDbTableLowerPath() == table
            );
            reverseQueryByTable[ table ] = reverseQuery;
        }

        if ( type == "update" ) {
            rows.push(prev);
        }

        rows.push(row);
    });


    let from = [];

    for (let table in rowsByTable) {
        let rows = rowsByTable[ table ];

        let firstRow = rows[0];
        let columns = Object.keys(firstRow);
        
        // changed rows
        let values = rows.map(row => {
            let values = Object.values(row);
            return `(${values})`;
        });
        values = values.join(",\n");

        // withQuery name
        let alias;

        let reverseQuery = reverseQueryByTable[ table ];
        if ( reverseQuery.as ) {
            alias = reverseQuery.as.toString();
        }
        else if ( reverseQuery.table.link.length == 1 ) {
            alias = reverseQuery.table.toString();
        }
        else {
            alias = `"${ reverseQuery.table.toString() }"`;
        }

        from.push(`(
            with
                ${ alias } (${ columns }) as (
                    values
                        ${values}
                )
            select * from ${ alias }
        ) as ${ alias }`);
    }
    from = from.join(",");

    
    // updating table
    let cacheTable = cache.forDbTable.getLowerPath();

    // updating columns
    let columns = [];
    cache.syntax.select.columns.forEach(column => {
        columns.push( column.as.toLowerCase() );
    });
    columns = columns.join(",\n");

    // data for updating columns
    let select = cache.syntax.select.toString();

    // conditions for search
    let where = [];
    for (let table in reverseQueryByTable) {
        let reverseQuery = reverseQueryByTable[ table ];
        let condition = reverseQuery.expression.toString();

        where.push(condition);
    }
    where = where.join("\n or \n");

    return `
        update ${ cacheTable } set 
            (
                ${ columns }
            ) = (
                ${ select }
            )
        from ${ from }
        where
            ${ where }
    `;
}

function buildInsertCache({
    row,
    cache
}) {
    let forTableAlias;
    if ( cache.syntax.as ) {
        forTableAlias = cache.syntax.as.toLowerCase();
    }
    else if ( cache.syntax.table.link.length == 1 ) {
        forTableAlias = cache.syntax.table.first().toLowerCase();
    }
    else {
        forTableAlias = `"${ cache.syntax.table.getDbTableLowerPath() }"`;
    }
    
    let select = cache.syntax.select.clone();
    select.replaceLink(
        (cache.syntax.as ||
        cache.syntax.table).toString(),

        forTableAlias
    );

    let updateColumns = select.columns.map(column => 
        column.as.toLowerCase()
    );

    let where = [];
    cache.forPrimaryKey.columns.forEach(key => {
        let value = row[ key ];
        let dbColumn = cache.forDbTable.getColumn( key );
        let type = dbColumn.type;

        let sqlValue = value2sql( type, value );

        where.push(`${forTableAlias}.${key} = ${ sqlValue }`);
    });

    where = where.join(" \nand\n ");



    let rowSql = [];
    for (let key in row) {
        let value = row[ key ];
        let dbColumn = cache.forDbTable.getColumn( key );
        let type = dbColumn.type;

        let sqlValue = value2sql( type, value );
        rowSql.push(`${sqlValue} as ${key}`);
    }
    rowSql = rowSql.join(",\n");


    return `
        update ${ cache.forDbTable.getLowerPath() } as ${ forTableAlias } set
            (
                ${ updateColumns.join(",\n") }
            ) = (
                ${ select.toString() }
            )
        where
            ${ where }
        
        returning *
    `;
}

module.exports = {
    buildUpdateCache,
    buildInsertCache
};