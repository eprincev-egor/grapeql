"use strict";

const SelectPlan = require("./SelectPlan");

class Deps {
    constructor({select, server}) {
        this.tables = [];
        this._tables = {};

        this.plan = new SelectPlan({
            select,
            server
        });
        this.plan.build();

        this.parsePlan( this.plan );
    }

    parsePlan(plan) {
        // select 1 from companies
        plan.fromItems.forEach(fromItem => {
            // links from where part and from select part
            let parentLinks = plan.necessaryLinks;
            parentLinks = parentLinks.concat(
                plan.selectedLinks 
            );

            // links only from this fromItem
            parentLinks = parentLinks.filter(link => 
                fromItem.links.includes(link)
            );

            this.addFromItem(fromItem, parentLinks);
        });

        // select id, ...
        plan.columns.forEach(column => {
            column.links.forEach(link => {
                this.addLink(link);
            });
        });

        // select ... where id > 100
        plan.necessaryLinks.forEach(link => {
            this.addLink(link);
        });
    }

    addFromItem(fromItem, parentLinks) {
        if ( fromItem.dbTable ) {
            this.addTable( fromItem.dbTable );
        }
        else if ( fromItem.plan ) {
            this.parseSubPlan( fromItem.plan, parentLinks );
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

    }

    addLink(link) {
        let {name, fromItem} = link;

        if ( fromItem.dbTable ) {
            this.addColumn( fromItem.dbTable, name );
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
            columns: []
        };

        this.tables.push( table );
        this._tables[ path ] = table;

        return table;
    }

    addColumn(dbTable, columnName) {
        let table = this.addTable(dbTable);
        if ( !table.columns.includes(columnName) ) {
            table.columns.push(columnName);
        }
    }
}

module.exports = Deps;