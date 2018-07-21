"use strict";

const _ = require("lodash");
const pg = require("pg");
const Transaction = require("./Transaction");
const DbDatabase = require("./DbObject/DbDatabase");
const QueryBuilder = require("./QueryBuilder/QueryBuilder");

const express = require("express");
const bodyParser = require("body-parser");

class GrapeQL {
    constructor(config) {
        this.config = this.prepareConfig(config);


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
    
    prepareConfig(config) {
        let outConfig = {};
        
        if ( !config ) {
            config = "grapeql.config";
        }
        
        if ( _.isString(config) ) {
            config = require(config);
        }
        
        if ( !_.isObject(config) ) {
            throw new Error("config must are object");
        }
        
        
        // validate database config
        outConfig.db = {};
        if ( !_.isObject(config.db) ) {
            throw new Error("config.db must are object");
        }
        outConfig.db = _.merge({
            host: "localhost",
            user: false,
            password: false,
            port: 5432,
            database: false
        }, config.db);
        
        if ( !_.isString(outConfig.db.host) ) {
            throw new Error("config.db.host must are string");
        }
        if ( !_.isString(outConfig.db.user) ) {
            throw new Error("config.db.user must are string");
        }
        if ( !_.isString(outConfig.db.password) ) {
            throw new Error("config.db.password must are string");
        }
        if ( !_.isNumber(outConfig.db.port) ) {
            throw new Error("config.db.port must are number");
        }
        if ( !_.isString(outConfig.db.database) ) {
            throw new Error("config.db.database must are string");
        }
        
        
        // validate workdir, workfiles
        outConfig.workdir = "./workdir";
        if ( _.isString(config.workdir) || _.isBoolean(config.workdir) ) {
            outConfig.workdir = config.workdir;
        }
        outConfig.workfiles = _.merge({
            cache: "**/*.sql",
            query: "**/*.sql",
            events: "**/*.events.js"
        }, config.workfiles);

        
        // validate http server
        outConfig.http = {
            port: 80
        };
        if ( config.http === false ) {
            outConfig.http = false;
        }
        else if ( _.isObject(config.http) ) {
            if ( "port" in config.http ) {
                if ( _.isNumber(config.http.port) ) {
                    outConfig.http.port = config.http.port;
                }
                else {
                    throw new Error("config.http.port must be are number");
                }
            }
        }

        return outConfig;
    }

    async start() {
        this.pool = new pg.Pool( this.config.db );
        
        let db;
        try {
            db = await this.pool.connect();
        } catch(err) {
            throw new Error("cannot connect to database");
        }
        this.db = db;

        await this.loadDatabaseInfo();
        await this.initSystemFunctions();
        this.initExpress();
        
        await this.initQueryBuilder();

        if ( this.config.http ) {
            this.express.listen( this.config.http.port );
        }
    }
    
    async loadDatabaseInfo() {
        this.database = new DbDatabase();
        await this.database.load(this.db);
    }
    
    async initSystemFunctions() {
        await this.db.query(`
        create or replace function raise_exception(text)
        returns void as $$
        begin
          raise exception '%', $1;
        end;
        $$ language plpgsql;
        `);
    }
    
    async initQueryBuilder() {
        this.queryBuilder = new QueryBuilder({
            server: this
        });
        
        if ( this.config.workdir === false ) {
            return;
        }
        
        await this.queryBuilder.addWorkdir(
            this.config.workdir, 
            this.config.workfiles.query
        );
    }
    
    async stop() {
        await this.db.end();
    }
    
    async transaction() {
        let transaction = new Transaction({
            server: this
        });
        
        await transaction.begin();
        
        return transaction;
    }

    addTrigger(TriggerClass) {
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

            let dbTable = this.database.findTable(tableName);
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

    async _callTriggers({
        commandType, 
        command, 
        result,
        transaction
    }) {
        if ( commandType == "select" ) {
            return;
        }
        
        let table = command.table; // Syntax ObjectLink
        table = table.getDbTableLowerPath();

        let triggers;

        triggers = this._triggers[ table ];
        if ( !triggers ) {
            return;
        }

        triggers = triggers[ commandType ];
        if ( !triggers || !triggers.length ) {
            return;
        }

        if ( !_.isArray(result) ) {
            result = [result];
        }

        for (let i = 0, n = result.length; i < n; i++) {
            let row = result[i];
            
            for (let j = 0, m = triggers.length; j < m; j++) {
                let trigger = triggers[j];
                
                if ( commandType == "update" ) {
                    let prev = {},
                        changes = {},
                        newRow = {};
                    
                    for (let key in row) {
                        if ( /old_/.test(key) ) {
                            continue;
                        }
                        
                        let value = row[ key ];
                        prev[ key ] = value;
                        newRow[ key ] = value;

                        let oldKey = "old_" + key;
                        if ( oldKey in row ) {
                            let oldValue = row[ oldKey ];
                            
                            if ( oldValue != value ) {
                                changes[ key ] = value;
                                prev[ key ] = oldValue;
                            }
                        }
                    }

                    await trigger.handle({
                        db: transaction,
                        row: newRow,
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
    }

    initExpress() {
        if ( !this.config.http ) {
            return;
        }

        this.express = express();
        
        this.express.use( bodyParser.json() );
        this.express.use( bodyParser.urlencoded({
            extended: true
        }) );
    }

    async query(sql, vars) {
        let transaction = await this.transaction();
        let result;
        
        try {
            result = await transaction.query(sql, vars);
            await transaction.commit();
            transaction.end();
        } catch(err) {
            await transaction.rollback();
            transaction.end();
            throw err;
        }
        
        return result;
    }
}

GrapeQL.start = async function(config) {
    let server = new GrapeQL(config);
    await server.start();
    return server;
};

module.exports = GrapeQL;
