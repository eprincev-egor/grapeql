"use strict";

const Filter = require("../../../filter/Filter");

module.exports = {
    buildIndexOf({
        node,
        server,
        orderBy,
        row,
        where
    }) {
        let select = this.clone();

        select.clearColumns();

        if ( !row ) {
            throw new Error("row must be are filter");
        }
        row = new Filter(row);
        let rowColumns = row.getColumns();

        select.buildColumns({
            columns: rowColumns,
            originalSelect: this
        });

        select.addColumn("row_number() over() as grapeql_row_index");

        if ( orderBy ) {
            select.buildOrderBy({
                orderBy,
                originalSelect: this
            });
        }

        if ( where ) {
            select.buildWhere({
                where,
                originalSelect: this,
                node,
                server
            });
        }

        select.buildFromFiles({ server });

        let sqlModel = this.buildSqlModelByColumns({
            node,
            server,
            columns: rowColumns,
            originalSelect: this
        });
        for (let key in sqlModel) {
            let elem = sqlModel[key];
            elem.sql = `query."${ key }"`;
        }
        let rowFilterSql = row.toSql(sqlModel);

        return new this.Coach.Select(`
            select
                query.grapeql_row_index as index
            from (${select}) as query
            where ${ rowFilterSql }
        `.trim());
    }
};
