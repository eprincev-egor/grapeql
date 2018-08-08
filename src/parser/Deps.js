"use strict";

const Column = require("./syntax/Column");
const ColumnLink = require("./syntax/ColumnLink");
const Select = require("./syntax/Select/Select");
const FromItem = require("./syntax/FromItem");
const With = require("./syntax/With");

class Deps {
    constructor({
        select, 
        server, 
        // with (...) select withColumns
        withColumns,
        withAllColumns
    }) {
        this.select = select;
        this.server = server;

        this.tables = [];
        this._tables = {};
        
        // separation children on groups
        this.prepare();

        // right join (and similar) will change select
        this.parseFromItems();

        // usual select
        if ( withColumns == null ) {
            this.parseStars();
            this.parseColumns( this.linksFromSelectColumns );
            this.parseColumns( this.linksFromOther );
        } 
        // is sub select from with part
        else {
            // parent selected all columns
            if ( withAllColumns ) {
                this.parseStars();
                this.parseColumns( this.linksFromSelectColumns );
                this.parseColumns( this.linksFromOther );
            }
            else {
                this.parseColumns( this.linksFromOther );

                withColumns.forEach(columnName => {
                    let column = this.select.getColumnByName(columnName);
                    
                    // with x as ( select 1 as id ) select id from x
                    if ( column ) {
                        let columnLinks = [];
                        column.expression.walk((child, walker) => {
                            if ( child instanceof Select ) {
                                return walker.skip();
                            }

                            if ( child instanceof ColumnLink ) {
                                columnLinks.push( child );
                            }
                        });

                        this.parseColumns( columnLinks );
                    }
                    // with x as ( select * from companies ) select id from x
                    else {
                        this.parseColumnName( columnName );
                    }
                });
            }
        }

        this.parseWith();
    }

    prepare() {
        let fromItems = [],
            starLinks = [],
            starLinksMap = {},
            linksFromSelectColumns = [],
            linksFromOther = [];
        
        this.select.walk((child, walker) => {
            if ( child instanceof With ) {
                return walker.skip();
            }
            if ( child instanceof Select ) {
                return walker.skip();
            }

            if ( child instanceof FromItem ) {
                fromItems.push(child);
            }

            if ( child instanceof ColumnLink ) {
                let link = child.toLowerString();

                if ( child.isStar() ) {
                    // remove duplicates
                    if ( link in starLinksMap ) {
                        return;
                    }
                    starLinksMap[ link ] = true;

                    starLinks.push( child );
                } else {
                    let parentColumn = child.findParentInstance(Column);
                    let isSelectColumns = parentColumn && this.select.columns.includes( parentColumn );
                    
                    if ( isSelectColumns ) {
                        linksFromSelectColumns.push( child );
                    } else {
                        linksFromOther.push( child );
                    }
                }
            }
        });

        this.fromItems = fromItems;
        this.starLinks = starLinks;
        this.linksFromSelectColumns = linksFromSelectColumns;
        this.linksFromOther = linksFromOther;
    }
    
    parseFromItems() {
        this.fromItems.forEach(fromItem => {
            this.addTableByFromItem(fromItem);
        });
    }

    parseStars() {
        this.starLinks.forEach(starLink => {
            let fromItems = this.getFromItemsByStar(starLink);

            fromItems.forEach(fromItem => {
                let table = this.addTableByFromItem(fromItem);
                let dbTable = fromItem.getDbTable( this.server );

                if ( !dbTable ) {
                    return;
                }

                for (let key in dbTable.columns) {
                    this.addColumn(table, key);
                }
            });
        });
    }

    parseColumns(columnLinks) {
        columnLinks.forEach(columnLink => {
            let fromItem = this.getFromItemByColumn(columnLink);
            let table = this.addTableByFromItem(fromItem);

            let columnName = columnLink.getLast().toLowerCase();
            this.addColumn(table, columnName);
        });
    }

    parseColumnName(columnName) {
        let columnLink = new ColumnLink( columnName );

        let fromItem = this.getFromItemByColumn(columnLink);
        let table = this.addTableByFromItem(fromItem);

        this.addColumn(table, columnName);
    }

    parseWith() {
        let withQueries = [];

        this.fromItems.forEach(fromItem => {
            let withQuery = fromItem.getWithQuery();
            
            if ( !withQuery ) {
                return;
            }

            if ( !withQueries.includes(withQuery) ) {
                withQueries.push(withQuery);
            }
        });


        withQueries.forEach(withQuery => {
            let table = this._tables[ "public." + withQuery.name ];

            if ( !table ) {
                return;
            }

            let prevWithQueries = [];

            if ( this.select.with ) {
                let queriesArr = this.select.with.queriesArr;
                let index = queriesArr.indexOf( withQuery );
                
                if ( index >= 1 ) {
                    prevWithQueries = queriesArr.slice(0, index);
                }
            }

            let deps = new Deps({
                select: withQuery.select,
                server: this.server,
                withColumns: table.columns,
                withAllColumns: this.hasStar( table )
            });

            this.removeTable( table );
            this.addDeps( deps );
        });
    }

    hasStar(table) {
        let fromItems = this.getFromItemsByTableName( table.name );

        for (let i = 0, n = fromItems.length; i < n; i++) {
            let fromItem = fromItems[ i ];
            let alias = fromItem.as || fromItem.table.first();

            for (let j = 0, m = this.starLinks.length; j < m; j++) {
                let starLink = this.starLinks[ j ];
                
                // select *
                if ( starLink.link.length == 1 ) {
                    return true;
                }

                // select companies.*
                if ( starLink.first().equal( alias ) ) {
                    return true;
                }
            }
        }
    }

    getFromItemsByTableName(tableName) {
        return this.fromItems.filter(fromItem => {
            let alias = fromItem.as || fromItem.table.first();
            alias = alias.toLowerCase();

            return alias == tableName;
        });
    }

    getFromItemsByStar(starLink) {
        if ( starLink.link.length == 1 ) {
            return this.fromItems;
        }

        let starName = starLink.first();

        return this.fromItems.filter(fromItem => {
            let alias;

            if ( fromItem.as ) {
                alias = fromItem.as;
            } 
            else if ( fromItem.table ) {
                alias = fromItem.table.getLast();
            }

            return alias && alias.equal( starName );
        });
    }

    getFromItemByColumn(columnLink) {
        if ( columnLink.link.length == 1 ) {
            let columnName = columnLink.first().toLowerCase();

            return this.fromItems.find(fromItem => 
                existsColumn({
                    fromItem,
                    server: this.server,
                    columnName
                })
            );
        }

        return this.fromItems.find(fromItem => {
            let alias = fromItem.as || fromItem.table.getLast();

            if ( columnLink.link.length == 2 ) {
                return alias.equal(
                    columnLink.first()
                );
            }

            return true;
        });
    }

    addTableByFromItem(fromItem) {
        let tableLink = fromItem.table;
        let path = tableLink.getDbTableLowerPath();
        
        let table = this._tables[ path ];
        
        if ( !table ) {
            let {schemaName, tableName} = this._tableLink2schemaTable(tableLink);
            table = {
                schema: schemaName,
                name: tableName,
                columns: [],
                _columns: {}
            };

            this._tables[ path ] = table;
            this.tables.push( table );    
        }

        return table;
    }

    removeTable(tableToRemove) {
        for (let i = 0, n = this.tables.length; i < n; i++) {
            let table = this.tables[ i ];
            
            if ( table.schema != tableToRemove.schema ) {
                continue;
            }
            if ( table.name != tableToRemove.name ) {
                continue;
            }

            this.tables.splice(i, 1);
            break;
        }

        let path = tableToRemove.schema + "." + tableToRemove.name;
        delete this._tables[ path ];
    }

    addColumn(table, columnName) {
        if ( columnName in table._columns ) {
            return;
        }

        table.columns.push( columnName );
        table._columns[ columnName ] = true;
    }

    addDeps(deps) {
        deps.tables.forEach(table => {
            this.addTable(table);
        });
    }

    addTable(tableToAdd) {
        let existsTable;

        for (let i = 0, n = this.tables.length; i < n; i++) {
            let table = this.tables[ i ];
            
            if ( table.schema != tableToAdd.schema ) {
                continue;
            }
            if ( table.name != tableToAdd.name ) {
                continue;
            }

            existsTable = table;
        }

        if ( !existsTable ) {
            this.tables.push( tableToAdd );
            this._tables[ tableToAdd.schema + "." + tableToAdd.name ] = tableToAdd;
        } else {
            tableToAdd.columns.forEach(key => {
                if ( !existsTable.columns.includes(key) ) {
                    existsTable.columns.push(key);
                }
            });
        }
    }

    _tableLink2schemaTable(tableLink) {
        let tableName = tableLink.first();
        let schemaName = "public";

        if ( tableLink.link.length > 1 ) {
            let schema = tableName;
            schema = schema.toLowerCase();

            schemaName = schema;

            tableName = tableLink.link[1];
        }

        tableName = tableName.toLowerCase();

        return {
            schemaName,
            tableName
        };
    }
}

function existsColumn({fromItem, server, columnName}) {
    let withQuery = fromItem.getWithQuery();

    if ( withQuery ) {
        if ( withQuery.select ) {
            let fromItems = [];
            
            let column = withQuery.select.getColumnByName( columnName );
            if ( column ) {
                return true;
            }

            withQuery.select.eachFromItem(fromItem => fromItems.push(fromItem));
    
            return fromItems.some(fromItem => 
                existsColumn({
                    fromItem,
                    server,
                    columnName
                })
            );
        }
        return;
    }

    let dbTable = fromItem.getDbTable(server);
    if ( !dbTable ) {
        return;
    }

    return columnName in dbTable.columns;
}

module.exports = Deps;