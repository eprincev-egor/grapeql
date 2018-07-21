"use strict";

const _ = require("lodash");
const pg = require("pg");
const Transaction = require("./Transaction");
const DbDatabase = require("./DbObject/DbDatabase");
const QueryBuilder = require("./QueryBuilder/QueryBuilder");
const TriggerManager = require("./TriggerManager");

const express = require("express");
const bodyParser = require("body-parser");

class GrapeQL {
    constructor(config) {
        this.config = this.prepareConfig(config);
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
        this.initTriggerManager();
        
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

    initTriggerManager() {
        this.triggers = new TriggerManager(this);
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
