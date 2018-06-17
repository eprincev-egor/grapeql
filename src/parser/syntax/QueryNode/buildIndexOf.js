"use strict";

const Filter = require("../../../filter/Filter");

module.exports = {
    buildIndexOf({
        node,
        server,
        orderBy,
        row,
        where,
        vars
    }) {
        let select = this.select.clone();

        this.buildVars({
            select,
            vars
        });

        select.clearColumns();

        if ( !row ) {
            throw new Error("row must be are filter");
        }
        row = new Filter(row);
        let rowColumns = row.getColumns();

        this.buildColumns({
            select,
            columns: rowColumns,
            originalSelect: this.select
        });

        select.addColumn("row_number() over() as grapeql_row_index");

        if ( orderBy ) {
            this.buildOrderBy({
                select,
                orderBy,
                originalSelect: this.select
            });
        }

        if ( where ) {
            this.buildWhere({
                select,
                where,
                originalSelect: this.select,
                node,
                server
            });
        }

        this.buildFromFiles({ server, select });

        let sqlModel = this.buildSqlModelByColumns({
            select,
            node,
            server,
            columns: rowColumns,
            originalSelect: this.select
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
