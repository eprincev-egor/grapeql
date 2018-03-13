"use strict";

module.exports = {
    // params.server
    // params.columns
    buildFromFiles(params) {
        let server = params.server;
        
        this.joins.forEach(fromItem => {
            if ( !fromItem.file ) {
                return;
            }
            
            let file = fromItem.file;
            let node = server.getNodeByPath( file.toString() );
            console.log( node );
        });
    }
};
