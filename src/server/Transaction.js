"use strict";

let index = 0;

class Transaction {
    constructor({ server }) {
        this.server = server;
    }
    
    async begin() {
        this.db = await this.server.pool.connect();
        await this.db.query("begin");

        await this.server.triggers.callBeginTransaction({
            transaction: this
        });
    }

    async commit() {
        await this.server.triggers.callBeforeCommitTransaction({
            transaction: this
        });
        await this.db.query("commit");
    }
    
    async rollback() {
        await this.db.query("rollback; begin");
    }

    async query(sql, vars) {
        let savePointName = "sp" + index++;

        await this.db.query(`savepoint ${ savePointName }`);

        // parse sql and build vars
        let query = this.server.queryBuilder.buildQuery(sql, vars);
        let result, changesStack;

        try {
            // run sql and get all changes (insert/update/delete)
            let resp = await this.runAndCatchChanges(query);
            
            result = resp.result;
            changesStack = resp.changesStack;

            // call triggers
            await this.server.triggers.callByChanges({
                transaction: this,
                changesStack
            });

            // returning row, value, ...
            result = this.server.queryBuilder.customReturning(
                query,
                result
            );
        } catch(err) {
            // rollback last changes
            await this.db.query(`rollback to savepoint ${ savePointName }`);

            throw err;
        }

        return result;
    }

    async runAndCatchChanges(query) {
        let queryBuilder = this.server.queryBuilder;
        let catcher = queryBuilder.createChangesCatcher();
        
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
    
    async release() {
        await this.db.release();
    }
}

module.exports = Transaction;
