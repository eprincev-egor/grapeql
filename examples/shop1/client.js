"use strict";

const GrapeQL = require("GrapeQL");

class App {
    constructor() {
        this.start();
    }
    
    async start() {
        await GrapeQL.start();
        
        const Company = GrapeQL.Nodes.Company;
        
        let rows = await Company.get({
            rowsAsArray: true,
            columns: ["name", "Country.code_name"],
            sort: [{name: -1}],
            filter: [
                ["name", "contain", "ecu"],
                "or",
                ["Country.code_name", "is", "not null"]
            ],
            offset: 0,
            limit: 10
        });
        
        console.log( rows );
    }
}

///
window.app = new App();