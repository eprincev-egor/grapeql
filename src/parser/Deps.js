"use strict";

const TableLink = require("./syntax/TableLink");
const ColumnLink = require("./syntax/ColumnLink");
const Select = require("./syntax/Select/Select");
const FromItem = require("./syntax/FromItem");

class Deps {
    constructor({syntax}) {
        this.syntax = syntax;
        this.tables = [];
        this._tables = {};
        this.findDeps();
    }

    findDeps() {
        this.syntax.walk(tableLink => {
            if ( !(tableLink instanceof TableLink) ) {
                return;
            }

            let fromItem = tableLink.findParentInstance(FromItem);
            let select = tableLink.findParentInstance(Select);
            
            if ( !select || !fromItem ) {
                return;
            }

            
            let fullTableName = tableLink.getDbTableLowerPath();
            let table = this._tables[ fullTableName ];

            if ( !table ) {
                table = {
                    schema: "public",
                    name: "",
                    columns: [],
                    _columns: {}
                };

                let name = tableLink.first();

                if ( tableLink.length > 1 ) {
                    let schema = name;
                    schema = schema.toLowerCase();
    
                    table.schema = schema;
    
                    name = tableLink.link[1];
                }
    
                table.name = name.toLowerCase();
    
                this._tables[ fullTableName ] = table;
                this.tables.push( table );    
            }

            if ( table.columns == "*" ) {
                return;
            }

            let tableAlias = fromItem.as ? 
                fromItem.as.toLowerCase() : 
                table.name;

            // find in
            // select ...
            select.columns.some(column => {
                let stop;

                column.expression.walk((columnLink, walker) => {

                    this._addColumnLink({
                        table, 
                        tableAlias,
                        columnLink
                    });

                    if ( table.columns == "*" ) {
                        walker.stop();
                        stop = true;
                    }
                });

                return stop;
            });

            // find in where
            if ( table.columns != "*" && select.where ) {
                select.where.walk(columnLink => {

                    this._addColumnLink({
                        table, 
                        tableAlias,
                        columnLink
                    });
                });
            }

            // find in order by
            if ( table.columns != "*" && select.orderBy ) {
                select.orderBy.forEach(item => {
                    item.walk(columnLink => {
                        
                        this._addColumnLink({
                            table, 
                            tableAlias,
                            columnLink
                        });
                    });
                });
            }

            // find in group by
            if ( table.columns != "*" && select.groupBy ) {
                select.groupBy.forEach(item => {
                    item.walk(columnLink => {
                        
                        this._addColumnLink({
                            table, 
                            tableAlias,
                            columnLink
                        });
                    });
                });
            }
        });
    }

    _addColumnLink({table, tableAlias, columnLink}) {
        if ( !(columnLink instanceof ColumnLink) ) {
            return;
        }

        if ( columnLink.isStar() ) {
            table.columns = "*";
            return;
        }

        let columnName;
        
        if ( columnLink.link.length == 1 ) {
            columnName = columnLink.first().toLowerCase();
        }
        else if ( columnLink.link.length == 2 ) {
            let columnTable = columnLink.first().toLowerCase();
            
            if ( columnTable == tableAlias ) {
                columnName = columnLink.link[1];
                columnName = columnName.toLowerCase();
            }
        }
        else if ( columnLink.link.length == 3 ) {
            let schema = columnLink.first().toLowerCase();
            let columnTable = columnLink.link[1].toLowerCase();
            
            if (
                table.schema == schema && 
                table.name == columnTable 
            ) {
                columnName = columnLink.link[2].toLowerCase();
            }
        }

        if ( !columnName ) {
            return;
        }

        if ( columnName in table._columns ) {
            return;
        }

        table.columns.push(columnName);
        table._columns[ columnName ] = true;
    }
}

module.exports = Deps;