"use strict";

module.exports = {
    buildCount({
        node,
        server,
        where
    }) {
        let select = this.clone();

        select.clearColumns();
        select.addColumn("count(*) as count");

        if ( select.orderBy ) {
            select.orderBy.forEach(elem => {
                select.removeChild(elem);
            });
            delete select.orderBy;
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

        return select;
    }
};
