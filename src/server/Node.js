"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
const fs = require("fs");
const _ = require("lodash");

class Node {
    constructor(options, server) {
        this.server = server;
        
        if ( _.isString(options) ) {
            options = {file: options};
        }
        this.options = options;
        
        let fileBuffer = fs.readFileSync( options.file );
        let parsed = GrapeQLCoach.parseEntity( fileBuffer.toString() );
        this.parsed = parsed;
    }
    
    async get(request) {
        request = await this.preapareGetRequest(request);
        console.log(request);
        return [];
    }
    
    async preapareGetRequest(request) {
        let offset = 0;
        let limit = "all";
        
        if ( "offset" in request ) {
            offset = +request.offset;
            
            if ( offset < 0 ) {
                throw new Error("offset must by positive number: " + request.offset);
            }
        }
        
        if ( "limit" in request ) {
            if ( limit != "all" ) {
                limit = +request.limit;
                
                if ( limit < 0 ) {
                    throw new Error("limit must be 'all' or positive number: " + request.limit);
                }
            }
        }
        
        let columns = [];
        if ( Array.isArray(request.columns) ) {
            columns = request.columns;
        }
        columns.forEach(column => {
            if ( !_.isString(column) ) {
                throw new Error("column must be string: " + column);
            }
        });
        if ( !columns.length ) {
            throw new Error("columns must be array of strings: " + request.columns);
        }
        
        return {
            offset,
            limit,
            columns
        };
    }
}

module.exports = Node;
