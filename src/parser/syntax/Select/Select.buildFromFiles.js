"use strict";

module.exports = {
    // params.server
    // params.columns
    buildFromFiles(params) {
        let server = params.server;

        this.joins.forEach(join => {
            if ( !join.from.file ) {
                return;
            }

            let file = join.from.file;
            let node = this._getNodeByPath( server, file.toString() );

            if ( !node ) {
                throw new Error(`Node ${ file.toString() } does not exist`);
            }
        });
    },

    _getNodeByPath(server, path) {
        path = path.replace(/\.sql$/, "").replace(/[/.]/g, "");
        for (let name in server.nodes) {
            if ( name == path ) {
                return server.nodes[ name ];
            }
        }
    }
};
