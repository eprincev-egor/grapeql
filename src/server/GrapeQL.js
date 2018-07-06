"use strict";

const _ = require("lodash");
const pg = require("pg");
const glob = require("glob");
const fs = require("fs");
const Transaction = require("./Transaction");
const DbDatabase = require("./DbObject/DbDatabase");
const Node = require("./Node");

const express = require("express");
const bodyParser = require("body-parser");

class GrapeQL {
    constructor(config) {
        this.config = this.prepareConfig(config);
        this.nodes = {};


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
        
        await this.loadWorkdir();

        if ( this.config.http ) {
            this.express.listen( this.config.http.port );
        }
    }
    
    async getSystemConnect() {
        let db;
        
        try {
            db = new pg.Client( this.config.db );
            await db.connect();
        } catch(err) {
            throw new Error("cannot connect to database");
        }
        
        return db;
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
    
    async loadWorkdir() {
        if ( this.config.workdir === false ) {
            return;
        }
        
        let pattern = this.config.workdir + "/" + this.config.workfiles.query;
        let queryFiles = await getFileNames(pattern);
        
        let existsNames = {};
        queryFiles.forEach(filePath => {
            let queryName = filePath2queryName( filePath );
            if ( queryName in existsNames ) {
                throw new Error(`duplicate query name: ${ filePath }`);
            }
            
            let contentBuffer = fs.readFileSync(filePath);
            let sql = contentBuffer.toString();
            
            this.nodes[ queryName ] = new Node({
                name: queryName,
                sql,
                server: this
            });
        });
    }
    
    addNode(name, node) {
        let file;
        if ( _.isString(node) ) {
            if ( fs.existsSync(node) ) {
                file = node;
                node = fs.readFileSync( node );
            }
            node = new Node({sql: node, server: this});
            if ( file ) {
                node.file = file;
            }
            this.nodes[ name ] = node;
        }
        else if ( node instanceof Node ) {
            this.nodes[ name ] = node;
        }

        return node;
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

                await trigger.handle({
                    db: transaction,
                    row
                });
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
        let result = await transaction.query(sql, vars);
        await transaction.commit();
        transaction.end();
        return result;
    }
}

GrapeQL.start = async function(config) {
    let server = new GrapeQL(config);
    await server.start();
    return server;
};

async function getFileNames(globPattern) {
    return new Promise((resolve, reject) => {
        glob(globPattern, {}, (err, names) => {
            if ( err ) {
                reject(err);
            } else {
                resolve(names);
            }
        });
    });
}

function filePath2queryName(filePath) {
    let queryName = filePath;
    
    queryName = queryName.split("/");
    queryName = queryName.slice(-1)[0];
    
    if ( !queryName ) {
        throw new Error(`invalid query name: ${filePath}`);
    }
    
    queryName = queryName.replace(/\.sql$/i, "");
    if ( !queryName ) {
        throw new Error(`invalid query name: ${filePath}`);
    }
    
    return queryName;
}

module.exports = GrapeQL;
