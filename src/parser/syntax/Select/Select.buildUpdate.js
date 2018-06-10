"use strict";

module.exports = {
    buildUpdate({
        node,
        server,
        changes,
        where
    }) {
        let columns = Object.keys(changes);
        let select = this.buildSelect({
            node,
            server,
            columns,
            where
        });

        columns.forEach(key => {
            let link = new this.Coach.ObjectLink(key);

            select.getColumnSource({
                server, node,
                link, checkColumns: false
            });
        });
    }
};
