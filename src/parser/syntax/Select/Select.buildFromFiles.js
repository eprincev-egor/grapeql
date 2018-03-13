"use strict";

module.exports = {
    // params.server
    // params.columns
    buildFromFiles(params) {
        let server = params.server;
        
        this.from.forEach(fromItem => {
            if ( !fromItem.file ) {
                return;
            }
            
            let file = fromItem.file;
            
        });
    }
};
