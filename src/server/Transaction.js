"use strict";

const {value2sql} = require("../helpers");
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
        let command = GrapeQLCoach.parseCommand(sql);
        
        // $order_id::bigint
        this._pasteVars(command, vars);
        
        let result, commandType;
        if ( command instanceof GrapeQLCoach.Insert ) {
            commandType = "insert";
            result = await this._executeInsert(command);
        }
        else if ( command instanceof GrapeQLCoach.Update ) {
            commandType = "update";
            result = await this._executeUpdate(command);
        }
        else if ( command instanceof GrapeQLCoach.Delete ) {
            commandType = "delete";
            result = await this._executeDelete(command);
        }
        else if ( command instanceof GrapeQLCoach.Select ) {
            result = await this._executeSelect(command);
        }

        if ( commandType ) {
            this.server._onQuery(commandType, result);
        }

        return result;
    }
    
    _pasteVars(command, vars) {
        command.walk(variable => {
            if ( !(variable instanceof GrapeQLCoach.SystemVariable) ) {
                return;
            }

            let expression = variable.parent;
            let type = expression.getVariableType(variable);
            if ( !type ) {
                throw new Error(`expected cast for variable: ${variable}`);
            }

            let key = variable.toLowerCase();
            let $key = "$" + key;
            
            if ( $key in vars && key in vars ) {
                throw new Error(`duplicated variable name, please only one of ${key} or ${key}`);
            }

            let value;
            if ( $key in vars ) {
                value = vars[ $key ];
            } else {
                value = vars[ key ];
            }
            
            let sqlValue = value2sql(type, value);
            expression.replaceVariableWithType(variable, sqlValue);
        });
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
    
    async _executeUpdate(update) {
        let db = this.db;
        if ( !update.returning && !update.returningAll ) {
            update.returningAll = true;
        }

        let commandSql = update.toString({ pg: true });

        let result = await db.query(commandSql);

        if ( update.updateRow ) {
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
    
    async _executeDelete(deleteCommand) {
        let db = this.db;
        if ( !deleteCommand.returning && !deleteCommand.returningAll ) {
            deleteCommand.returningAll = true;
        }

        let commandSql = deleteCommand.toString({ pg: true });

        let result = await db.query(commandSql);

        if ( deleteCommand.deleteRow ) {
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
    
    async _executeSelect(select) {
        let db = this.db;
        let commandSql = select.toString({ pg: true });

        let result = await db.query(commandSql);
        
        if ( select.selectRow ) {
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
    
    async destroy() {
        await this.rollback();
        await this.db.release();
    }
}

module.exports = Transaction;
