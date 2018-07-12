"use strict";

function buildColumns({select, originalSelect, columns}) {
    select.clearColumns();

    columns.forEach(key => {
        let keyParts = key.split(".");

        let definedColumn = originalSelect.getColumnByAlias( key );
        if ( definedColumn ) {
            if ( definedColumn.expression.isLink() ) {
                let link = definedColumn.expression.getLink();
                let last = link.getLast();

                if ( last.strictEqualString(key) ) {
                    select.addColumn(`${ definedColumn.expression }`);
                    return;
                }
            }

            select.addColumn(`${ definedColumn.expression } as "${ key }"`);
            return;
        }

        let columnKey = key;
        let fromItem;
        if ( keyParts.length > 1 ) {
            fromItem = select.getFromItemByAlias( keyParts[0] );
            columnKey = keyParts.slice(-1)[0];
        } else {
            fromItem = select.from[0];
        }

        if ( columnKey == key ) {
            let fromSql = fromItem.getAliasSql();
            select.addColumn(`${ fromSql }.${ columnKey }`);
        } else {
            select.addColumn(`${ key } as "${ key }"`);
        }
    });
}

module.exports = buildColumns;