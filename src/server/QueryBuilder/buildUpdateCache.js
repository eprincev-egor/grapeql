"use strict";

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


    let withQueries = [];
    let from = [];

    for (let table in rowsByTable) {
        let rows = rowsByTable[ table ];

        let firstRow = rows[0];
        let columns = Object.keys(firstRow);
        
        let values = rows.map(row => {
            let values = Object.values(row);
            return `(${values})`;
        });
        values = values.join(",\n");

        withQueries.push(`
            "${ table }" (${ columns }) as (
                values
                    ${values}
            )
        `);
        from.push(`"${ table }"`);
    }
    withQueries = withQueries.join(",\n");
    from = from.join(",");

    
    // updating table
    let cacheTable = cache.dbTable.schema + "." + cache.dbTable.name;

    // updating columns
    let columns = [];
    cache.dbTable.columnsArr.forEach(dbColumn => {
        columns.push( dbColumn.name );
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
        with
            ${withQueries}
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

module.exports = buildUpdateCache;