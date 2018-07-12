"use strict";

function buildColumnExpression({originalSelect, key}) {
    let keyParts = key.split(".");

    let definedColumn = originalSelect.getColumnByAlias( key );
    if ( definedColumn ) {
        return definedColumn.expression.toString();
    }

    let columnKey = key;
    let fromItem;
    if ( keyParts.length > 1 ) {
        fromItem = originalSelect.getFromItemByAlias( keyParts[0] );
        columnKey = keyParts.slice(-1)[0];
    } else {
        fromItem = originalSelect.from[0];
    }

    if ( columnKey == key ) {
        let fromSql = fromItem.getAliasSql();
        return `${ fromSql }.${ columnKey }`;
    } else {
        return key;
    }
}

module.exports = buildColumnExpression;