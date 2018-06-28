"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");

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
        let result;
        
        try {
            result = await this._executeCommand(sql, vars);
        } catch(err) {
            await this.rollback();
            throw err;
        }
        
        return result;
    }
    
    async _executeCommand(sql, vars) {
        let command = GrapeQLCoach.parseCommand(sql);
        
        // $order_id::bigint
        this._pasteVars(command, vars);
        
        if ( command instanceof GrapeQLCoach.Insert ) {
            return await this._executeInsert(command);
        }
        else if ( command instanceof GrapeQLCoach.Update ) {
            return await this._executeUpdate(command);
        }
        else if ( command instanceof GrapeQLCoach.Delete ) {
            return await this._executeDelete(command);
        }
        else if ( command instanceof GrapeQLCoach.Select ) {
            return await this._executeSelect(command);
        }
    }
    
    _pasteVars() {
        
    }
    
    async _executeInsert(insert) {
        let db = this.db;
        if ( !insert.returning && !insert.returningAll ) {
            insert.returningAll = true;
        }
        
        let commandSql = insert.toString({ pg: true });
        
        let result = await db.query(commandSql);
        
        if ( insert.insertRow ) {
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
    
    async _executeUpdate() {
        
    }
    
    async _executeDelete() {
        
    }
    
    async _executeSelect() {
        
    }
    
    async destroy() {
        await this.rollback();
        await this.db.release();
    }
}

module.exports = Transaction;
