"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
//const {getDbTable} = require("../helpers");

class Transaction {
    constructor({ server }) {
        this.server = server;
        this.db = server.db;
    }
    
    async begin() {
        await this.db.query("begin");
    }
    
    async commit() {
        await this.db.query("commit");
    }
    
    async rollback() {
        await this.db.query("rollback");
    }
    
    async query(sql) {
        let command = GrapeQLCoach.parseCommand(sql);
        let db = this.server.db;
        
        if ( command instanceof GrapeQLCoach.Insert ) {
            let commandSql = command.toString({ pg: true });
            
            let result = await db.query(commandSql);
            
            if ( command.insertRow ) {
                if ( !result.rows || !result.rows.length ) {
                    return null;
                }
                
                if ( result.rows.length === 1 ) {
                    return result.rows[0];
                }
            } else {
                return result.rows || [];
            }
        }
    }
}

module.exports = Transaction;
