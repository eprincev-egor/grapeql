"use strict";

module.exports = {
    buildCount({
        node,
        server,
        where,
        vars
    }) {
        let select = this.select.clone();

        this.buildVars({
            select,
            vars
        });

        select.clearColumns();
        select.addColumn("count(*) as count");

        if ( select.orderBy ) {
            select.orderBy.forEach(elem => {
                select.removeChild(elem);
            });
            delete select.orderBy;
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

        return select;
    }
};
