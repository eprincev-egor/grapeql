"use strict";

const ObjectName = require("../syntax/ObjectName");
const ColumnLink = require("../syntax/ColumnLink");
const Select = require("../syntax/Select/Select");
const With = require("../syntax/With");
const Column = require("../syntax/Column");
const FromItem = require("../syntax/FromItem");

const Plan = require("./Plan");
const ValuesPlan = require("./ValuesPlan");

class SelectPlan extends Plan {
    build() {
        // from ...
        this.buildFrom();
        // select ...
        this.buildColumns();
        // where, order by, group by, etc
        this.buildNecessaryLinks();
        // select (select ...) from ...
        this.buildSubSelects();
    }

    buildFrom() {
        this.select.eachFromItem(fromItem => {
            let from = {
                link: fromItem.toTableLink(),
                as: fromItem.as,
                links: [],
                syntax: fromItem
            };

            if ( fromItem.select ) {
                from.plan = new SelectPlan({
                    select: fromItem.select,
                    server: this.server,
                    // keyword lateral gives access to parent fromItems
                    parentPlan: fromItem.lateral ? this : false
                });
                from.plan.build();
            } else {
                let withQuery = fromItem.getWithQuery();
                let dbTable = fromItem.getDbTable( this.server );
    
                if ( withQuery ) {
                    from.withQuery = withQuery;
    
                    if ( withQuery.select ) {
                        from.plan = new SelectPlan({
                            withQuery,
                            select: withQuery.select,
                            server: this.server
                        });
                        from.plan.build();
                    }
                    else if ( withQuery.values ) {
                        from.plan = new ValuesPlan({
                            withQuery,
                            values: withQuery.values,
                            server: this.server
                        });
                        from.plan.build();
                    }
                }
                else if ( dbTable ) {
                    from.dbTable = dbTable;
                }
            }

            this.fromItems.push( from );
        });
    }

    buildColumns() {
        this.select.columns.forEach(columnSyntax => {
            // select *
            // select companies.*
            if ( columnSyntax.isStar() ) {
                let starLink = columnSyntax.getLink();
                let fromItems = this.getFromItemsByStarLink(starLink);

                fromItems.forEach(fromItem => {
                    let columns = this.getAllColumnsFrom(fromItem);
                    this.columns = this.columns.concat( columns );

                    columns.forEach(column => {
                        let link = column.links[0];
                        fromItem.links.push( link );
                        this.selectedLinks.push( link );
                    });
                });

                return;
            }

            let column = {
                links: [],
                subPlans: []
            };

            // select 1 as id
            if ( columnSyntax.as ) {
                column.name = columnSyntax.as.toLowerCase();
            }
            // select companies.id
            else if ( columnSyntax.isLink() ) {
                let link = columnSyntax.getLink();
                column.name = link.last().toLowerCase();
            }

            // select id::text || name
            let columnLinks = [];
            columnSyntax.expression.walk((child, walker) => {
                if ( child instanceof Select ) {
                    let subPlan = new SelectPlan({
                        select: child,
                        server: this.server,
                        parentPlan: this
                    });
                    subPlan.build();

                    column.subPlans.push(subPlan);
                    return walker.skip();
                }

                if ( child instanceof ColumnLink ) {
                    columnLinks.push( child );
                }
            });

            this.parseColumnLinks(columnLinks, column.links);
            this.selectedLinks = this.selectedLinks.concat(column.links);

            this.columns.push( column );
        });

        this.columns.forEach((column, index) => {
            // with x (id, name) as (...)
            if ( this.withQuery && this.withQuery.columns ) {
                let withName = this.withQuery.columns[ index ];
                if ( withName ) {
                    column.name = withName.toLowerCase();
                }
            }
            let name = column.name;

            if ( name && !(name in this.columnByName) ) {
                this.columnByName[ name ] = column;
            }
        });
    }

    buildNecessaryLinks() {
        let columnLinks = [];

        this.select.walk((child, walker) => {
            if ( child instanceof With ) {
                return walker.skip();
            }
            if ( child instanceof Select ) {
                return walker.skip();
            }

            if ( child instanceof ColumnLink ) {
                let columnLink = child;

                let parentColumn = columnLink.findParentInstance(Column);
                let isSelectColumns = parentColumn && this.select.columns.includes( parentColumn );
                
                if ( isSelectColumns ) {
                    return;
                }

                columnLinks.push( columnLink );
            }
        });

        this.parseColumnLinks(columnLinks, this.necessaryLinks);
    }

    buildSubSelects() {
        let subSelects = [];

        this.select.walk((child, walker) => {
            if ( child instanceof With ) {
                return walker.skip();
            }
            if ( child instanceof FromItem ) {
                return walker.skip();
            }

            if ( child instanceof Select ) {
                subSelects.push( child );
                walker.skip();
            }
        });

        subSelects.forEach(subSelect => {
            let parentColumn = subSelect.findParentInstance(Column);
            let isSelectColumns = parentColumn && this.select.columns.includes( parentColumn );
            if ( isSelectColumns ) {
                return;
            }

            
            let subPlan = new SelectPlan({
                select: subSelect,
                server: this.server,
                parentPlan: this
            });
            subPlan.build();

            this.necessarySubPlans.push(subPlan);
        });
    }

    parseColumnLinks(columnLinks, storeLinks) {
        // select from companies where companies is not null
        // select from companies where companies.* is not null
        // select from companies where companies.id is not null
        columnLinks.forEach(columnLink => {
            let isTableLink = !!this.getFromItemByTableLink( columnLink );
            let fromItem = this.getFromItemByLink(columnLink);
            let isStar = columnLink.isStar();

            // select row_to_json( companies )
            if ( isTableLink || isStar ) {
                let subColumns = this.getAllColumnsFrom( fromItem );
                
                subColumns.forEach(subColumn => {
                    let subLink = subColumn.links[0];

                    storeLinks.push(subLink);
                    fromItem.links.push(subLink);
                });
            } else {
                let link = {
                    syntax: columnLink,
                    name: columnLink.last().toLowerCase(),
                    fromItem
                };

                storeLinks.push(link);
                fromItem.links.push(link);
            }
        });
    }

    getAllColumnsFrom(fromItem) {
        let allColumns = [];

        if ( fromItem.dbTable ) {
            let dbTable = fromItem.dbTable;

            dbTable.columnsArr.forEach(dbColumn => {
                allColumns.push({
                    name: dbColumn.name,
                    links: [{
                        name: dbColumn.name,
                        fromItem
                    }],
                    subPlans: []
                });
            });


            let cacheColumns = this.server.cache.getCacheColumns(fromItem.dbTable);

            if ( cacheColumns ) {
                cacheColumns.forEach(key => {
                    allColumns.push({
                        cache: true,
                        name: key,
                        links: [{
                            name: key,
                            fromItem
                        }],
                        subPlans: []
                    });
                });
            }
        }
        else if ( fromItem.plan ) {
            fromItem.plan.columns.forEach(subColumn => {
                let link = {subColumn, fromItem};
                let column = {
                    links: [link],
                    subPlans: []
                };

                if ( subColumn.name ) {
                    column.name = subColumn.name;
                    link.name = subColumn.name;
                }

                allColumns.push(column);
            });
        }

        return allColumns;
    }

    getFromItemByLink(columnLink) {
        let fromItems = this.fromItems;
        fromItems = fromItems.concat(
            this.getParentFromItems()
        );

        // all cases:
        // select id from companies, orders
        // select row_to_json( companies ) from companies
        // select row_to_json( cmp ) from companies as cmp
        // select cmp.id from companies as cmp
        // select companies.id from companies
        // select companies.* from companies
        // select companies.id from public.companies
        // select companies.* from public.companies
        // select public.companies.id from companies
        // select public.companies.* from companies
        // select row_to_json( public.companies ) from companies
        // select row_to_json( companies ) from public.companies
        // select row_to_json( public.companies ) from companies, test.companies
        // select row_to_json( test.companies ) from companies, test.companies
        // select test.companies.id from companies, test.companies
        // select test.companies.* from companies, test.companies
       
        // find by alias
        // cases:
        // select row_to_json( cmp ) from companies as cmp
        // select cmp.id from companies as cmp
        let fromItemByAlias = fromItems.find(fromItem => 
            fromItem.as && fromItem.as.equal( columnLink.first() )
        );
        if ( fromItemByAlias ) {
            return fromItemByAlias;
        }

        // transform stars to nothing
        // because it simplifies cases
        if ( columnLink.isStar() ) {
            columnLink = columnLink.slice(0, -1);
        }

        // remains cases:
        // select id from companies, orders
        // select row_to_json( companies ) from companies
        // select companies.id from companies
        // select companies.id from public.companies
        // select public.companies.id from companies
        // select row_to_json( public.companies ) from companies
        // select row_to_json( companies ) from public.companies
        // select row_to_json( public.companies ) from companies, test.companies
        // select row_to_json( test.companies ) from companies, test.companies
        // select test.companies.id from companies, test.companies

        
        // find fromItem, where columnLink is table name
        // cases:
        // select row_to_json( companies ) from companies
        // select row_to_json( public.companies ) from companies
        // select row_to_json( companies ) from public.companies
        // select row_to_json( public.companies ) from companies, test.companies
        // select row_to_json( test.companies ) from companies, test.companies
        let fromItemByTable = this.getFromItemByTableLink( columnLink, false );
        if ( fromItemByTable ) {
            return fromItemByTable;
        }

        // find by just column name
        // cases:
        // select id from companies, orders
        if ( columnLink.link.length == 1 ) {
            let columnName = columnLink.first().toLowerCase();

            return fromItems.find(fromItem => {
                if ( fromItem.dbTable ) {
                    let isNativeColumn = columnName in fromItem.dbTable.columns;
                    
                    if ( isNativeColumn ) {
                        return true;
                    }

                    let cacheColumns = this.server.cache.getCacheColumns( fromItem.dbTable );
                    if ( cacheColumns ) {
                        return cacheColumns.includes( columnName );
                    }
                }
                else if ( fromItem.plan ) {
                    return fromItem.plan.columns.some(column =>
                        column.name == columnName
                    );
                }
                else if ( fromItem.withQuery ) {
                    let withQuery = fromItem.withQuery;
                    
                    if ( withQuery.columns ) {
                        return withQuery.columns.some(name => name.toLowerCase() == columnName);
                    }
                }
            });
        }

        // remains cases:
        // select companies.id from companies
        // select companies.id from public.companies
        // select public.companies.id from companies
        // select test.companies.id from companies, test.companies
        
        // just remove column name from link and find as tableLink
        let tableLink = columnLink.slice(0, -1);
        return this.getFromItemByTableLink( tableLink, false );
    }

    getFromItemByTableLink(tableLink, useAliases = true) {
        let fromItemsWithoutAlias = [];
        let fromItemsWithAlias = [];
        let fromItems = this.fromItems;

        // for sub query
        let parentFromItems = this.getParentFromItems();
        fromItems = fromItems.concat( parentFromItems );

        fromItems.forEach(fromItem => {
            if ( fromItem.as ) {
                fromItemsWithAlias.push( fromItem );
            } else {
                fromItemsWithoutAlias.push( fromItem );
            }
        });

        // this function called from many places
        if ( useAliases && tableLink.link.length == 1 ) {
            let fromItemByAlias = fromItemsWithAlias.find(fromItem =>
                fromItem.as.equal( tableLink.first() )
            );

            if ( fromItemByAlias ) {
                return fromItemByAlias;
            }
        }

        // find fromItem, where columnLink is table name
        // cases:
        // select companies from companies
        // select public.companies from companies
        // select companies from public.companies
        // select public.companies from companies, test.companies
        // select test.companies from companies, test.companies

        // first, we filter fromItems by table name
        let tableName = tableLink.last();
        fromItems = fromItemsWithoutAlias.filter(fromItem =>
            fromItem.link.last().equal( tableName )
        );

        // only one fromItem has the right tableName
        if ( fromItems.length == 1 ) {
            return fromItems[0];
        }

        // check schema
        return fromItems.find(fromItem => {
            let fromSchema;
            if ( fromItem.link.length > 1 ) {
                fromSchema = fromItem.link.first();
            } else {
                fromSchema = new ObjectName("public");
            }


            let findSchema;
            if ( tableLink.link.length > 1 ) {
                findSchema = tableLink.first();
            } else {
                findSchema = new ObjectName("public");
            }

            return findSchema.equal( fromSchema );
        });
    }

    getFromItemsByStarLink(starLink) {
        // select *
        if ( starLink.link.length === 1 ) {
            return this.fromItems;
        }

        // select companies.*
        return [
            this.getFromItemByLink( starLink )
        ];
    }

    getParentFromItems() {
        let out = [];
        let parentPlan = this.parentPlan;

        while (parentPlan) {
            out = out.concat( parentPlan.fromItems );

            parentPlan = parentPlan.parentPlan;
        }

        return out;
    }
}

Plan.SelectPlan = SelectPlan;

module.exports = SelectPlan;