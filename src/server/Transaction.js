"use strict";

class Transaction {
    constructor({ server }) {
        this.server = server;
    }
    
    async begin() {
        this.db = await this.server.pool.connect();
        await this.db.query("begin");

        let result = await this.db.query(`
            insert into gql_system.tmp default values;
            delete from gql_system.tmp
            returning xmax
        `);

        this.tid = result[1].rows[0].xmax;
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
        
        // run sql and get all changes (insert/update/delete)
        let {result, changesStack} = await this.runAndCatchChanges(query);

        // call triggers
        await this.server.triggers.callByChanges({
            transaction: this,
            changesStack
        });

        return result;
    }

    async runAndCatchChanges(query) {
        let queryBuilder = this.server.queryBuilder;
        let catcher = queryBuilder.createChangesCatcher( this.tid );
        
        // transform query for catching changes
        let sql = catcher.build(query);

        // pg can return array of results
        let pgResult = await this._executeSql( sql );
        // get out result and all changes
        let {result, changesStack} = catcher.prepareResult(pgResult);
        
        return {
            changesStack,
            result
        };
    }
    
    // just redefine callstack
    async _executeSql(sql) {
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
