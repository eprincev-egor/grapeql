"use strict";

const _ = require("lodash");
const Filter = require("../filter/Filter");

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
        
        let where = false;
        if ( request.where ) {
            where = new Filter( request.where );
        }
        
        return {
            offset,
            limit,
            columns,
            where
        };
    }
    
    get(request) {
        request = this.preapareGetRequest(request);
        
        let originalQuery = this.node.parsed,
            outQuery = originalQuery.clone(),
            usedColumns = request.columns.slice(),
            // select * in scheme
            hasStarColumn = originalQuery.columns.find(column => column.isStar());
        
        if ( request.where ) {
            let filterColumns = request.where.getColumns();
            filterColumns.forEach(key => {
                if ( !usedColumns.includes(key) ) {
                    usedColumns.push(key);
                }
            });
        }
        
        outQuery.clearColumns();
        
        request.columns.forEach(key => {
            let findedColumn = originalQuery.columns.find(column => {
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
                outQuery.addColumn(`${ findedColumn.expression } as "${ key }"`);
            } else {
                if ( !hasStarColumn ) {
                    throw new Error(`column ${key} not defined`);
                } else {
                    let findedTableSchemeColumn, findedScheme, findedTable;
                    originalQuery.from.some(from => {
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
                    
                    outQuery.addColumn(sql);
                }
            }
        });
        
        // offset 100, limit 10
        outQuery.clearOffsets();
        
        if ( "limit" in request && request.limit != "all" ) {
            outQuery.setLimit(request.limit);
        }
        if ( "offset" in request && request.offset > 0 ) {
            outQuery.setOffset(request.offset);
        }
        
        
        return outQuery;
    }
}

// need for tests
if ( typeof window !== "undefined" ) {
    if ( typeof window.tests !== "undefined" ) {
        window.tests.QueryBuilder = QueryBuilder;
    }
}

module.exports = QueryBuilder;
