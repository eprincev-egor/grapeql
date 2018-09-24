"use strict";

const SelectPlan = require("./SelectPlan");

class Deps {
    constructor({select, server}) {
        this.server = server;

        this.tables = [];
        this._tables = {};

        this.files = [];
        this._files = {};
        
        this.plan = new SelectPlan({
            select,
            server
        });
        this.plan.build();

        this.parsePlan( this.plan );
    }

    parsePlan(plan) {
        // links from where part and from select part
        let allLinks = plan.necessaryLinks;
        allLinks = allLinks.concat(
            plan.selectedLinks 
        );

        // select 1 from companies
        plan.fromItems.forEach(fromItem => {
            // links only from this fromItem
            let parentLinks = allLinks.filter(link => 
                fromItem.links.includes(link)
            );

            this.addFromItem(fromItem, parentLinks);
        });

        // select id, ...
        plan.columns.forEach(column => {
            column.links.forEach(link => {
                this.addLink(link);
            });

            column.subPlans.forEach(subPlan => {
                this.parsePlan(subPlan);
            });
        });

        // select ... where id > 100
        plan.necessaryLinks.forEach(link => {
            this.addLink(link);
        });

        // select  ... where (select ...)
        plan.necessarySubPlans.forEach(subPlan => {
            this.parsePlan(subPlan);
        });
    }

    addFromItem(fromItem, parentLinks) {
        if ( fromItem.dbTable ) {
            this.addTable( fromItem.dbTable );
        }
        else if ( fromItem.plan ) {
            this.parseSubPlan( fromItem.plan, parentLinks );
        }
        else if ( fromItem.file ) {
            this.addFile( fromItem.file );
        }
    }

    parseSubPlan(subPlan, parentLinks) {
        let childLinks = [];

        // select ... where id > 100
        subPlan.necessaryLinks.forEach(link => {
            this.addLink(link);
            childLinks.push( link );
        });

        parentLinks.forEach(parentLink => {
            let column;

            if ( parentLink.subColumn ) {
                column = parentLink.subColumn;
            } else {
                let name = parentLink.name;
                column = subPlan.columnByName[ name ];
            }
            
            column.links.forEach(link => {
                this.addLink( link );
                childLinks.push( link );
            });

            column.subPlans.forEach(subPlan => {
                this.parsePlan(subPlan);
            });
        });

        // select 1 from companies
        subPlan.fromItems.forEach(fromItem => {
            // links from where part
            let parentLinks = childLinks.slice();

            // links only from this fromItem
            parentLinks = parentLinks.filter(link => 
                fromItem.links.includes(link)
            );

            this.addFromItem(fromItem, parentLinks);
        });

        // select ... where (select ...)
        subPlan.necessarySubPlans.forEach(subPlan => {
            this.parsePlan(subPlan);
        });
    }

    addLink(link) {
        let {fromItem} = link;

        if ( fromItem.dbTable || fromItem.file ) {
            this.addColumn( link );
        }
    }

    addTable(dbTable) {
        let path = dbTable.schema + "." + dbTable.name;
        let table = this._tables[ path ];
        
        if ( table ) {
            return table;
        }

        table = {
            schema: dbTable.schema,
            name: dbTable.name,
            columns: [],
            cacheColumns: [],
            cacheFrom: [],

            _allCacheColumns: this.server.cache.getCacheColumns(dbTable) || []
        };

        this.tables.push( table );
        this._tables[ path ] = table;

        return table;
    }

    addFile(file) {
        let fromFile = this._files[ file ];

        if ( fromFile ) {
            return fromFile;
        }

        fromFile = {
            file,
            columns: []
        };

        this.files.push( fromFile );
        this._files[ file ] = fromFile;
    }

    addColumn(link) {
        let columnName = link.name;
        let fromItem = link.fromItem;

        if ( fromItem.dbTable ) {
            let table = this.addTable( fromItem.dbTable );

            if ( table._allCacheColumns.includes(columnName) ) {
                if ( !table.cacheColumns.includes(columnName) ) {
                    table.cacheColumns.push(columnName);
                }
    
                if ( !table.cacheFrom.includes( fromItem ) ) {
                    table.cacheFrom.push( fromItem );
                }
            } else {
                if ( !table.columns.includes(columnName) ) {
                    table.columns.push(columnName);
                }
            }
        }

        if ( fromItem.file ) {
            let file = this.addFile( fromItem.file );

            if ( !file.columns.includes(columnName) ) {
                file.columns.push(columnName);
            }
        }
    }
}

module.exports = Deps;