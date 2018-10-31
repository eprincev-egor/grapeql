"use strict";

const GrapeQLCoach = require("../../parser/GrapeQLCoach");
const fs = require("fs");
const glob = require("glob");

const buildDelete = require("./buildDelete");
const buildInsert = require("./buildInsert");
const buildUpdate = require("./buildUpdate");
const buildSelect = require("./buildSelect");
const buildCount = require("./buildCount");
const buildIndexOf = require("./buildIndexOf");
const buildQueryVars = require("./buildQueryVars");
const ChangesCatcher = require("./ChangesCatcher");
const customReturning = require("./customReturning");

class QueryBuilder {
    constructor({ server }) {
        this.server = server;
        
        // {
        //     "Company": {
        //         name: "Company",
        //         file: "Company.sql",
        //         query: <QueryNode>
        //     }
        // }
        this.nodes = {};
    }

    async addWorkdir(workdir, pattern) {
        pattern = workdir + "/" + pattern;
        let queryFiles = await getFileNames(pattern);
        
        queryFiles.forEach(filePath => {
            this.addFile(filePath);
        });
    }
    
    // addFile("./Company.sql")
    // addFile("Client", "./Company.sql")
    // addFile("Company", "select * from company")
    addFile(arg1, arg2) {
        let filePath;
        let queryName;
        let sql;

        if ( arg2 ) {
            queryName = arg1;
            
            // addFile("Client", "./Company.sql")
            if ( fs.existsSync(arg2) ) {
                let contentBuffer = fs.readFileSync(filePath);
                sql = contentBuffer.toString();
            }
            // addFile("Company", "select * from company")
            else {
                sql = arg2;
            }

            filePath = `./${queryName}.sql`;
        } 
        // addFile("./Company.sql")
        else {
            filePath = arg1;
            queryName = filePath2queryName( filePath );
            
            let contentBuffer = fs.readFileSync(filePath);
            sql = contentBuffer.toString();
        }



        if ( queryName in this.nodes ) {
            throw new Error(`duplicate query name: ${ filePath }`);
        }

        

        let query = GrapeQLCoach.parseEntity(sql);

        this.nodes[ queryName ] = {
            name: queryName,
            file: filePath,
            query 
        };
    }

    clear() {
        this.nodes = {};
    }

    buildDelete(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildDelete({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildInsert(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildInsert({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildSelect(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildSelect({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildIndexOf(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildIndexOf({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildCount(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildCount({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildUpdate(request) {
        let queryName = request.node;
        let node = this.nodes[ queryName ];

        return buildUpdate({
            queryBuilder: this, 
            queryNode: node.query, 
            request
        });
    }

    buildQuery(sql, vars) {
        let query = GrapeQLCoach.parseCommand(sql);     

        // $order_id::bigint => 1
        buildQueryVars(query, vars);

        return query;
    }

    createChangesCatcher() {
        return new ChangesCatcher( this );
    }

    getQueryNodeByFile(file) {
        for (let key in this.nodes) {
            let node = this.nodes[ key ];
            let leftFile = node.file.replace(/\.sql$/, "");
            let rightFile = file.toString().replace(/\.sql$/, "");
    
            if ( leftFile == rightFile ) {
                return node.query;
            }
        }
    }

    getQueryTableName(query) {
        return query.table.getDbTableLowerPath();
    }

    getQueryCommandType(query) {
        if ( query instanceof GrapeQLCoach.Select ) {
            return "select";
        }
        if ( query instanceof GrapeQLCoach.Insert ) {
            return "insert";
        }
        if ( query instanceof GrapeQLCoach.Delete ) {
            return "delete";
        }
        if ( query instanceof GrapeQLCoach.Update ) {
            return "update";
        }
    }

    customReturning(query, pgResult) {
        return customReturning(query, pgResult);
    }
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

module.exports = QueryBuilder;