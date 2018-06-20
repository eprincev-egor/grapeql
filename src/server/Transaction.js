"use strict";

const GrapeQLCoach = require("../parser/GrapeQLCoach");
const {getDbTable} = require("../helpers");

class Transaction {
    constructor({ server }) {
        this.server = server;
        this.stack = [];
    }
    
    async query(sql) {
        let coach = new GrapeQLCoach(sql);
        coach.replaceComments();
        coach.skipSpace();
        
        if ( coach.isInsert() ) {
            let insert = coach.parseInsert();
            let table = insert.table;
            let dbTable = getDbTable(this.server, table);
            
            
            if ( insert.defaultValues ) {
                let row = await this._getDefaultRow(dbTable);
                
                this.stack.push({
                    action: "insert",
                    row
                });
                
                return row;
            }
            else if ( insert.values ) {
                let dbColumns = [];
                let sql = [];
                
                if ( insert.columns ) {
                    insert.columns.forEach(name => {
                        let dbColumn = dbTable.getColumn( name.toString() );
                        dbColumns.push( dbColumn );
                    });
                } else {
                    for (let key in dbTable.columns) {
                        let dbColumn = dbTable.columns[ key ];
                        dbColumns.push( dbColumn );
                    }
                }
                
                for (let i = 0, n = insert.values.length; i < n; i++) {
                    let valuesRow = insert.values[i];
                    let sqlValues = [];
                    let hasValue = {};
                    
                    for (let j = 0, m = valuesRow.items.length; j < m; j++) {
                        let item = valuesRow.items[j];
                        let dbColumn = dbColumns[j];
                        let sqlValue;
                        
                        if ( item.default ) {
                            sqlValue = dbColumn.default || "null";
                        } else {
                            sqlValue = item.expression.toString();
                        }
                        
                        hasValue[ dbColumn.name ] = true;
                        sqlValues.push(`${sqlValue} as ${dbColumn.name}`);
                    }
                    
                    for (let key in dbTable.columns) {
                        let dbColumn = dbTable.columns[ key ];
                        
                        if ( dbColumn.name in hasValue ) {
                            continue;
                        }
                        
                        sqlValues.push(`${ dbColumn.default } as ${dbColumn.name}`);
                    }
                    
                    sql.push("select " + sqlValues.join(", "));
                }
                
                let result = await this.server.db.query(sql.join(" union all "));
                let rows = result.rows;
                
                rows.forEach(row => {
                    this.stack.push({
                        action: "insert",
                        row
                    });
                });
                
                return rows;
            }
        }
    }
    
    async _getDefaultRow(dbTable) {
        let defaultsSql = [];
        
        for (let key in dbTable.columns) {
            let dbColumn = dbTable.columns[ key ];
            
            if ( dbColumn.default ) {
                defaultsSql.push(`${dbColumn.default} as ${key}`);
            }
        }
        
        if ( !defaultsSql.length ) {
            return {};
        }
        
        let sql = "select " + defaultsSql.join(", ");
        let result = await this.server.db.query(sql);
        
        return result.rows[0];
    }
}

module.exports = Transaction;
