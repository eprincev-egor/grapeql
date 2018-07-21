"use strict";

class Transaction {
    constructor({ server }) {
        this.server = server;
    }
    
    async begin() {
        this.db = await this.server.pool.connect();
        await this.db.query("begin");
    }
    
    async commit() {
        await this.db.query("commit");
    }
    
    async rollback() {
        await this.db.query("rollback");
    }
    
    async query(sql, vars) {
        // parse sql and build vars
        let query = this.server.queryBuilder.buildQuery(sql, vars);
        
        // run query and call triggers
        let result = await this.server.triggers.executeQuery({
            transaction: this,
            query
        });

        return result;
    }
    
    // called by TriggerManager
    // just redefine callstack
    async _executeQuery(query) {
        let sql = query.toString({ pg: true });

        try {
            return await this.db.query(sql);
        } catch(dbError) {
            // redefine stack
            throw new Error( dbError.message );
        }
    }
    
    async end() {
        await this.db.end();
    }
}

module.exports = Transaction;
