"use strict";

const _ = require("lodash");

class TriggerManager {
    constructor(server) {
        this.server = server;
        
        // key is table name with schema name over dot
        // value is object, where
        // key is command type (insert, update, delete)
        // value is array of objects like are:
        // {
        //    trigger,
        //    handle
        // }
        //  
        // example:
        //  {
        //      "public.orders": {
        //          "insert": [{
        //              trigger: TriggerClass,
        //              handle: async(event) => {}
        //          }]
        //      }
        //  }
        this._triggers = {};

        // begin/beforeCommit  etc
        this._systemTriggers = {};
    }

    async create(TriggerClass) {
        let trigger = new TriggerClass();
        let events = trigger.getEvents();
        let db = this.server.db;

        if ( !_.isObject(events) || _.isEmpty(events) ) {
            throw new Error("events must be not empty object");
        }

        for (let key in events) {
            let value = events[ key ];

            let handle = trigger[ value ] || value;
            if ( !_.isFunction(handle) ) {
                throw new Error(`handle must be are function, or method name: ${value}`);
            }

            if ( key == "begin" || key == "beforeCommit" ) {
                this._createSystemTrigger(key, handle);
                continue;
            }


            // listen table changes
            
            if ( !/^(insert|update|delete):(\w+\.)?\w+$/.test(key) ) {
                throw new Error(`invalid event name: ${key}`);
            }

            key = key.split(":");
            let commandType = key[0];
            let tableName = key[1];

            let dbTable = this.server.database.findTable(tableName);
            if ( !dbTable ) {
                throw new Error(`table name not found: ${tableName}`);
            }

            let lowerPath = dbTable.getLowerPath();
            
            if ( !this._triggers[lowerPath] ) {
                this._triggers[lowerPath] = {};
            }

            if ( !this._triggers[lowerPath][commandType] ) {
                this._triggers[lowerPath][commandType] = [];
            }

            this._triggers[lowerPath][commandType].push({
                trigger,
                handle: async(triggerEvent) => {
                    await handle.call(trigger, triggerEvent);
                }
            });

            await db.query(`
                DROP TRIGGER if exists zzzz_log_changes ON ${ lowerPath };
                
                CREATE TRIGGER zzzz_log_changes
                AFTER INSERT OR UPDATE OR DELETE
                ON ${ lowerPath }
                FOR EACH ROW
                EXECUTE PROCEDURE gql_system.log_changes();            
            `);
        }

        return trigger;
    }

    async call({
        transaction,
        // insert/update/delete
        type,
        // public.orders
        table,

        // insert/update/delete
        row,
        // update
        prev,
        changes
    }) {
        let triggers;

        triggers = this._triggers[ table ];
        if ( !triggers ) {
            return;
        }

        triggers = triggers[ type ];
        if ( !triggers || !triggers.length ) {
            return;
        }

        for (let i = 0, n = triggers.length; i < n; i++) {
            let trigger = triggers[i];
            
            if ( type == "update" ) {
                await trigger.handle({
                    type,
                    table,
                    transaction,
                    db: transaction,
                    row: row,
                    changes,
                    prev
                });
            } else {
                await trigger.handle({
                    type,
                    table,
                    transaction,
                    db: transaction,
                    row
                });
            }
        }
    }

    async callByChanges({
        transaction,
        changesStack
    }) {
        for (let i = 0, n = changesStack.length; i < n; i++) {
            let {
                type, 
                table, 
                row, 
                prev, 
                changes
            } = changesStack[i];

            await this.call({
                transaction,
                type,
                table,
                row,
                prev,
                changes
            });
        }
    }

    _createSystemTrigger(event, handle) {
        let handlers = this._systemTriggers[ event ];

        if ( !handlers )  {
            handlers = [];
            this._systemTriggers[ event ] = handlers;
        }

        handlers.push( handle );
    }

    async callBeginTransaction({ transaction }) {
        let handlers = this._systemTriggers[ "begin" ];
        if ( !handlers ) {
            return;
        }

        for (let i = 0, n = handlers.length; i < n; i++) {
            let handler = handlers[i];

            await handler({ 
                db: transaction,
                transaction
            });
        }
    }

    async callBeforeCommitTransaction({ transaction }) {
        let handlers = this._systemTriggers[ "beforeCommit" ];
        if ( !handlers ) {
            return;
        }

        for (let i = 0, n = handlers.length; i < n; i++) {
            let handler = handlers[i];

            await handler({ 
                db: transaction,
                transaction
            });
        }
    }
}

module.exports = TriggerManager;