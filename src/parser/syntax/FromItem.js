"use strict";

const Syntax = require("./Syntax");

class FromItem extends Syntax {
    parse(coach) {
        let needAs = false;

        // file Order.sql
        if ( coach.isFile() ) {
            this.file = coach.parseFile();
            this.addChild(this.file);
            coach.skipSpace();
        }
        // [ LATERAL ] ( select ) [ AS ] alias
        else if ( coach.is("(") || coach.is(/lateral\s*\(/i) ) {
            let isLateral = false;
            if ( coach.isWord("lateral") ) {
                isLateral = true;
                coach.readWord(); // lateral
                coach.skipSpace();
            }

            coach.i++; // (
            coach.skipSpace();

            this.lateral = isLateral;
            this.select = coach.parseSelect();
            this.addChild(this.select);

            coach.skipSpace();
            coach.expect(")");
            coach.skipSpace();

            needAs = true;
        }
        // [ LATERAL ] function_name ( [ argument [, ...] ] )
        //            [ WITH ORDINALITY ] [ [ AS ] alias ]
        else if ( this.isFromFunctionCall(coach) ) {
            let isLateral = false;
            if ( coach.isWord("lateral") ) {
                isLateral = true;
                coach.readWord(); // lateral
                coach.skipSpace();
            }

            this.lateral = isLateral;
            this.withOrdinality = false;
            this.functionCall = coach.parseFunctionCall();
            this.addChild(this.functionCall);

            coach.skipSpace();

            if ( coach.isWord("with") ) {
                coach.expect(/with\s+ordinality\s+/i);
                this.withOrdinality = true;
            }

            needAs = true;
        }
        // [ ONLY ] table_name [ * ] [ [ AS ] alias
        else {
            let isOnly = false;
            if ( coach.isWord("only") ) {
                isOnly = true;
                coach.readWord(); // only
                coach.skipSpace();
            }

            this.only = isOnly;
            this.table =  coach.parseTableLink();
            this.addChild(this.table);

            coach.skipSpace();

            if ( coach.is("*") ) {
                coach.i++; // *
                coach.skipSpace();
            }
        }

        if ( needAs || coach.isWord("as") ) {
            coach.expectWord("as");
            coach.skipSpace();

            this.as = coach.parseObjectName();
            this.addChild(this.as);
        }

        // [ ( column_alias [, ...] ) ]
        if ( coach.is(/\s*\(/) ) {
            coach.skipSpace();
            coach.i++; // (
            coach.skipSpace();

            this.columns = coach.parseComma("ObjectName");
            coach.skipSpace();

            coach.expect(")");
        }

        this.joins = coach.parseChain("Join");
        this.joins.map(join => this.addChild(join));
    }

    isFromFunctionCall(coach) {
        let i = coach.i;

        if ( coach.isWord("lateral") ) {
            coach.readWord();
            coach.skipSpace();
        }
        let isFunctionCall = coach.isFunctionCall();

        coach.i = i;
        return isFunctionCall;
    }

    is(coach) {
        return coach.is(/only|lateral|\(/) || coach.isWord() || coach.isDoubleQuotes() || coach.isFile();
    }

    clone() {
        let clone = new FromItem();
        this.fillClone(clone);
        return clone;
    }

    fillClone(clone, options) {
        options = options || {joins: true};

        if ( this.file ) {
            clone.file = this.file.clone();
            clone.addChild(clone.file);
        }
        else if ( this.select ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }
            clone.select = this.select.clone();
            clone.addChild(clone.select);
        }
        else if ( this.functionCall ) {
            if ( this.lateral ) {
                clone.lateral = true;
            }

            clone.functionCall = this.functionCall.clone();
            clone.addChild(clone.functionCall);

            if ( this.withOrdinality ) {
                clone.withOrdinality = true;
            }
        }
        else if ( this.table ) {
            if ( this.only ) {
                clone.only = true;
            }

            clone.table = this.table.clone();
            clone.addChild(clone.table);
        }

        if ( this.as ) {
            clone.as = this.as.clone();
            clone.addChild(clone.as);
        }

        if ( this.columns ) {
            clone.columns = this.columns.map(name => name.clone());
        }

        if ( options.joins !== false ) {
            clone.joins = this.joins.map(join => join.clone());
            clone.joins.forEach(join => clone.addChild(join));
        }
    }

    clear(options) {
        if ( this.file ) {
            this.removeChild(this.file);
            delete this.file;
        }

        if ( this.functionCall ) {
            this.removeChild(this.functionCall);
            delete this.functionCall;
        }

        delete this.withOrdinality;

        if ( this.table ) {
            this.removeChild(this.table);
            delete this.table;
        }

        if ( this.select ) {
            this.removeChild(this.select);
            delete this.select;
        }

        delete this.only;
        delete this.lateral;

        if ( this.as ) {
            this.removeChild(this.as);
            delete this.as;
        }

        if ( this.columns ) {
            this.columns.forEach(column => this.removeChild(column));
            delete this.columns;
        }


        if ( !options || options.joins !== false ) {
            if ( this.joins ) {
                this.joins.forEach(join => this.removeChild(join));
            }
            this.joins = [];
        }
    }

    toString() {
        let out = "";

        if ( this.file ) {
            out += this.file.toString();
        }
        else if ( this.select ) {
            if ( this.lateral ) {
                out += "lateral ";
            }
            out += "(";
            out += this.select.toString();
            out += ")";
        }
        else if ( this.functionCall ) {
            if ( this.lateral ) {
                out += "lateral ";
            }

            out += this.functionCall.toString();

            if ( this.withOrdinality ) {
                out += " with ordinality";
            }
        }
        else if ( this.table ) {
            if ( this.only ) {
                out += "only ";
            }

            out += this.table.toString();
        }

        if ( this.as ) {
            out += " as ";
            out += this.as.toString();
        }

        if ( this.columns ) {
            out += " (";
            out += this.columns.map(name => name.toString()).join(", ");
            out += ")";
        }

        if ( this.joins ) {
            this.joins.forEach(join => {
                out += " ";
                out += join.toString();
            });
        }

        return out;
    }

    getAliasSql() {
        if ( this.as ) {
            return this.as.toString();
        }
        else if ( this.table ) {
            return this.table.toString();
        }
        else if ( this.file ) {
            return this.file.toObjectName().toString();
        }
    }

    toTableLink() {
        const TableLink = this.Coach.TableLink;
        let sql = this.getAliasSql();
        return new TableLink(sql);
    }

    getDbTable(server) {
        let tableLink = this.table.link;
        let tableName;

        let dbSchema;
        if ( tableLink.length > 1 ) {
            let schemaObjectName = tableLink[0];

            for (let schemaName in server.database.schemas) {
                if ( schemaObjectName.equalString( schemaName ) ) {
                    dbSchema = server.database.schemas[ schemaName ];
                    break;
                }
            }

            tableName = tableLink[1];
        } else {
            dbSchema = server.getSchema("public");
            tableName = tableLink[0];
        }

        tableName = tableName.word || tableName.content;
        return dbSchema.getTable( tableName );
    }

    eachFromItem(iteration) {
        let result;

        for (let i = 0, n = this.joins.length; i < n; i++) {
            let fromItem = this.joins[i].from;
            result = iteration(fromItem);

            if ( result === false ) {
                return;
            }

            result = fromItem.eachFromItem(iteration);
            if ( result === false ) {
                return;
            }
        }
    }

    eachJoin(iteration) {
        let result;

        for (let i = 0, n = this.joins.length; i < n; i++) {
            let join = this.joins[i];
            result = iteration(join);

            if ( result === false ) {
                return;
            }

            result = join.from.eachJoin(iteration);
            if ( result === false ) {
                return;
            }
        }
    }

    isDefinedFromLink(fromLink) {
        let link = this.toTableLink();
        if ( link.equalLink( fromLink ) ) {
            return true;
        }

        if ( this.joins ) {
            return this.joins.some(join => (
                join.from.isDefinedFromLink(fromLink)
            ));
        }
    }

    removeUnnecessaryJoins({
        server, select,
        checkRemovable = true
    }) {
        for (let i = this.joins.length - 1; i >= 0; i--) {
            let join = this.joins[ i ];

            if ( checkRemovable && !join.isRemovable({ server }) ) {
                continue;
            }

            let fromLink = join.from.toTableLink();
            let isUsedJoin = (
                select.isHelpfullJoin(join, {checkJoins: false}) ||
                this._isUsedFromLinkAfter({select, fromLink, i}) ||
                join.from._isUsedChildJoins({
                    select, fromLink,
                    rootFrom: this, i
                })
            );

            join.from.removeUnnecessaryJoins({
                server, select,
                checkRemovable: isUsedJoin ? true : false
            });

            if ( join.from.joins.length ) {
                continue;
            }

            if ( isUsedJoin ) {
                continue;
            }

            this.joins.splice(i, 1);
            this.removeChild(join);
        }
    }

    _isUsedFromLinkAfter({select, fromLink, i}) {
        i++;
        for (let n = this.joins.length; i < n; i++) {
            let nextJoin = this.joins[ i ];

            if ( select.isUsedFromLink(fromLink, {startChild: nextJoin}) ) {
                return true;
            }

            if ( nextJoin.from._isUsedFromLinkAfter({
                select,
                fromLink,
                i: -1
            }) ) {
                return true;
            }
        }
    }

    _isUsedChildJoins({select, fromLink, rootFrom, i}) {
        for (let j = 0, n = this.joins.length; j < n; j++) {
            let join = this.joins[ j ];

            if ( select.isHelpfullJoin(join, {checkJoins: false}) ) {
                return true;
            }

            if ( rootFrom._isUsedFromLinkAfter({select, fromLink, i}) ) {
                return true;
            }

            if ( join.from._isUsedChildJoins({
                select, fromLink,
                rootFrom, i
            }) ) {
                return true;
            }
        }
    }

    addJoinAfter(join, afterJoin) {
        this.addChild(join);

        if ( afterJoin ) {
            let index = this.joins.indexOf( afterJoin );
            if ( index == -1 ) {
                this.joins.push( join );
            } else {
                this.joins.splice(index + 1, 0, join);
            }
        } else {
            this.joins.unshift( join );
        }
    }
}

module.exports = FromItem;
