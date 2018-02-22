"use strict";

const _ = require("lodash");
const Filter = require("../filter/Filter");
const _grape_query_columns = "_grape_query_columns";

class Query {
    constructor(params) {
        this.request = params.request;
        this.server = params.server;
        this.node = params.node;
        
        this.preapareRequest();
        this.build();
    }
    
    preapareRequest() {
        let request = this.request;
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
        
        this.request = {
            offset,
            limit,
            columns,
            where
        };
    }
    
    build() {
        let request = this.request;
        this.originalSelect = this.node.parsed;
        this.select = this.originalSelect.clone();
        
        
        
        // select * in scheme
        let hasStarColumn = this.originalSelect.columns.find(column => column.isStar());
        
        let usedColumns = request.columns.slice();
        if ( request.where ) {
            let filterColumns = request.where.getColumns();
            filterColumns.forEach(key => {
                if ( !usedColumns.includes(key) ) {
                    usedColumns.push(key);
                }
            });
        }
        
        let columnExpressionByKey = {};
        usedColumns.forEach(key => {
            let findedColumn = this.originalSelect.columns.find(column => {
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
                columnExpressionByKey[ key ] = findedColumn.expression.toString();
            } else {
                if ( !hasStarColumn ) {
                    throw new Error(`column ${key} not defined`);
                } else {
                    let findedTableSchemeColumn, findedScheme, findedTable;
                    this.originalSelect.from.some(from => {
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
                    sql += findedTableSchemeColumn.name.toString();
                    
                    columnExpressionByKey[ key ] = sql;
                }
            }
        });
        
        this.select.clearColumns();
        
        let columnsSql = [];
        let sqlModel = {};
        for (let key in columnExpressionByKey) {
            let sql = columnExpressionByKey[ key ];
            columnsSql.push(`  ${ sql } as "${ key }"`);
            
            let columnSql = `${ _grape_query_columns }."${ key }"`;
            let column = this.select.addColumn(columnSql);
            
            sqlModel[ key ] = {
                sql: columnSql,
                column
            };
        }
        
        this.select.addJoin(`left join lateral ( select\n\n${ columnsSql.join(",\n") }\n\n) as ${ _grape_query_columns } on true`);
        
        for (let key in sqlModel) {
            let column = sqlModel[ key ].column;
            
            sqlModel[ key ].type = column.expression.getType({
                server: this.server,
                node: this.node
            });
        }
        
        if ( "limit" in request && request.limit != "all" ) {
            this.select.setLimit(request.limit);
        }
        if ( "offset" in request && request.offset > 0 ) {
            this.select.setOffset(request.offset);
        }
        
        if ( request.where ) {
            let whereSql = request.where.toString( sqlModel );
            this.select.addWhere( whereSql );
        }
    }
    
    toString() {
        return this.select.toString();
    }
}

// need for tests
if ( typeof window !== "undefined" ) {
    if ( typeof window.tests !== "undefined" ) {
        window.tests.Query = Query;
    }
}

module.exports = Query;
