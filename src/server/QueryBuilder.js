"use strict";

const _ = require("lodash");

class QueryBuilder {
    constructor(server, node) {
        this.server = server;
        this.node = node;
    }
    
    preapareGetRequest(request) {
        let offset = 0;
        let limit = "all";
        
        if ( "offset" in request ) {
            offset = +request.offset;
            
            if ( offset < 0 ) {
                throw new Error("offset must by positive number: " + request.offset);
            }
        }
        
        if ( "limit" in request ) {
            limit = request.limit;
            
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
    
    get(request) {
        request = this.preapareGetRequest(request);
        
        let parsed = this.node.parsed;
        let query = "select\n";
        
        let columns = [];
        let starColumn = parsed.columns.find(column => column.isStar());
        
        request.columns.forEach(key => {
            let findedColumn = parsed.columns.find(column => {
                let as = column.as;
                
                if ( !as ) {
                    if ( column.expression.isLink() ) {
                        let link = column.expression.getLink();
                        let last = link.getLast();
                        
                        if ( 
                            last.word && last.word.toLowerCase() == key.toLowerCase() ||
                            last.content && last.content == key
                        ) {
                            return column;
                        }
                    }
                } else {
                    if ( 
                        as.alias.word && as.alias.word.toLowerCase() == key.toLowerCase() ||
                        as.alias.content && as.alias.content == key
                    ) {
                        return column;
                    }
                }
            });
            
            if ( findedColumn ) {
                columns.push(`${ findedColumn.expression } as "${ key }"`);
            } else {
                if ( !starColumn ) {
                    throw new Error(`column ${key} not defined`);
                } else {
                    let findedTableSchemeColumn, findedScheme, findedTable;
                    parsed.from.some(from => {
                        if ( from.table ) {
                            let scheme, table;
                            
                            if ( from.table.link.length === 1 ) {
                                scheme = {word: "public"};
                                table = from.table.link[0];
                            } else {
                                scheme = from.table.link[0];
                                table = from.table.link[1];
                            }
                            
                            for (let tableName in this.server.tables) {
                                if ( table.word ) {
                                    if ( table.word.toLowerCase() != tableName ) {
                                        continue;
                                    }
                                }
                                if ( table.content ) {
                                    if ( table.content != tableName ) {
                                        continue;
                                    }
                                }
                                
                                let tableScheme = this.server.tables[ tableName ];
                                
                                if ( scheme.word ) {
                                    if ( scheme.word.toLowerCase() != (tableScheme.scheme || "public") ) {
                                        continue;
                                    }
                                }
                                if ( scheme.content ) {
                                    if ( scheme.content != (tableScheme.scheme || "public") ) {
                                        continue;
                                    }
                                }
                                
                                findedScheme = scheme;
                                findedTable = table;
                                findedTableSchemeColumn = tableScheme.columns[ key.toLowerCase() ];
                                return true;
                            }
                        }
                    });
                    
                    if ( !findedTableSchemeColumn ) {
                        throw new Error(`column ${key} not found in scheme`);
                    }
                    
                    let sql = "";
                    if ( findedScheme.word ) {
                        sql += findedScheme.word.toLowerCase();
                    }
                    if ( findedScheme.content ) {
                        sql += findedScheme.toString();
                    }
                    
                    sql += ".";
                    
                    if ( findedTable.word ) {
                        sql += findedTable.word.toLowerCase();
                    }
                    if ( findedTable.content ) {
                        sql += findedTable.toString();
                    }
                    
                    sql += ".";
                    sql += `${ findedTableSchemeColumn.name } as "${ key }"`;
                    
                    columns.push(sql);
                }
            }
        });

        query += columns.join(",\n");
        query += "\n";
        query += "from " + parsed.from.toString(); // Arr => "from1, from2"
        query += "\n";
        
        if ( request.offset ) {
            query += `offset ${ request.offset}\n`;
        }
        
        if ( request.limit && request.limit != "all" ) {
            query += `limit ${ request.limit }\n`;
        }
        
        return query;
    }
}

// need for tests
if ( typeof window !== "undefined" ) {
    if ( typeof window.tests !== "undefined" ) {
        window.tests.QueryBuilder = QueryBuilder;
    }
}

module.exports = QueryBuilder;