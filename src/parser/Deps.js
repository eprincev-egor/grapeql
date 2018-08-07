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
        withAllColumns,
        withQueries
    }) {
        this.select = select;
        this.server = server;

        this.tables = [];
        this._tables = {};
        

        // parent withQueries
        this.parentWithQueries = withQueries || [];
        this.withQueries = this.parentWithQueries;

        // current withQueries
        if ( this.select.with ) {
            // current withQueries must be before parent
            this.withQueries = this.select.with.queriesArr.concat(
                this.withQueries
            );
        }



        // separation children on groups
        this.prepare();

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
                    let column = this.select.columns.find(column => {
                        if ( column.isStar() ) {
                            return;
                        }

                        let alias;

                        if ( column.as ) {
                            alias = column.as.toLowerCase();
                        }
                        else if ( column.expression.isLink() ) {
                            let link = column.expression.getLink();
                            alias = link.getLast();

                            alias = alias.toLowerCase();
                        }

                        return alias == columnName;
                    });
                    
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

    parseStars() {
        this.starLinks.forEach(starLink => {
            let fromItems = this.getFromItemsByStar(starLink);

            fromItems.forEach(fromItem => {
                let table = this.addTableByFromItem(fromItem);
                
                let withQuery = this.getWithQueryByFromItem( fromItem );
                if ( withQuery ) {
                    return;
                }

                let path = `${ table.schema }.${ table.name }`;
                let dbTable = this.server.database.findTable( path );

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

    getWithQueryByFromItem(fromItem) {
        let tableLink = fromItem.table;
            
        if ( tableLink.link.length != 1 ) {
            return;
        }

        let name = tableLink.first();
        return this.withQueries.find(withQuery => withQuery.name.equal(name));
    }

    parseWith() {
        let withQueries = [];

        this.fromItems.map(fromItem => {
            let withQuery = this.getWithQueryByFromItem( fromItem );
            
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
                withAllColumns: this.hasStar( table ),
                // prevWithQueries must be before parentWithQueries
                withQueries: prevWithQueries.concat(this.parentWithQueries)
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

    getFromItemsByStar() {
        return this.fromItems;
    }

    getFromItemByColumn() {
        return this.fromItems[0];
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

        if ( tableLink.length > 1 ) {
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

module.exports = Deps;