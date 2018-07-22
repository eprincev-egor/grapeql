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
    }

    create(TriggerClass) {
        let trigger = new TriggerClass();
        let events = trigger.getEvents();
        
        if ( !_.isObject(events) || _.isEmpty(events) ) {
            throw new Error("events must be not empty object");
        }

        for (let key in events) {
            let value = events[ key ];

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

            let handle = trigger[ value ] || value;
            if ( !_.isFunction(handle) ) {
                throw new Error(`handle must be are function, or method name: ${value}`);
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
                    db: transaction,
                    row: row,
                    changes,
                    prev
                });
            } else {
                await trigger.handle({
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
}

module.exports = TriggerManager;