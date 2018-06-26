"use strict";

const _ = require("lodash");
const pg = require("pg");
const glob = require("glob");
const fs = require("fs");
const Transaction = require("./Transaction");
const DbDatabase = require("./DbObject/DbDatabase");
const Node = require("./Node");

class GrapeQL {
    constructor(config) {
        this.config = this.prepareConfig(config);
        this.nodes = {};
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
            throw new Error("config.db.port must are string");
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
        
        return outConfig;
    }

    async start() {
        this.db = await this.getSystemConnect();

        await this.loadDatabaseInfo();
        await this.initSystemFunctions();
        await this.loadWorkdir();
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
