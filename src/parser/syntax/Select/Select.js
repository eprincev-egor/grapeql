"use strict";

const Syntax = require("../Syntax");

const removeUnnesaryJoinsMethods = require("./Select.removeUnnesaryJoins");
const getColumnSourceMethods = require("./Select.getColumnSource");
const buildFromFilesMethods = require("./Select.buildFromFiles");
const {PUBLIC_SCHEMA_NAME} = require("./helpers");

// https://www.postgresql.org/docs/9.5/static/sql-select.html
/*

[ WITH [ RECURSIVE ] with_query [, ...] ]
SELECT [ ALL | DISTINCT [ ON ( expression [, ...] ) ] ]
    [ * | expression [ [ AS ] output_name ] [, ...] ]
    [ FROM from_item [, ...] ]
    [ WHERE condition ]
    [ GROUP BY grouping_element [, ...] ]
    [ HAVING condition [, ...] ]
    [ WINDOW window_name AS ( window_definition ) [, ...] ]
    [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
    [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
    [ LIMIT { count | ALL } ]
    [ OFFSET start [ ROW | ROWS ] ]
    [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]

where from_item can be one of:

    [ ONLY ] table_name [ * ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
                [ TABLESAMPLE sampling_method ( argument [, ...] ) [ REPEATABLE ( seed ) ] ]
    [ LATERAL ] ( select ) [ AS ] alias [ ( column_alias [, ...] ) ]
    with_query_name [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] ) [ AS ] alias ( column_definition [, ...] )
    [ LATERAL ] function_name ( [ argument [, ...] ] ) AS ( column_definition [, ...] )
    [ LATERAL ] ROWS FROM( function_name ( [ argument [, ...] ] ) [ AS ( column_definition [, ...] ) ] [, ...] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    from_item [ NATURAL ] join_type from_item [ ON join_condition | USING ( join_column [, ...] ) ]

and grouping_element can be one of:

    ( )
    expression
    ( expression [, ...] )
    ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
    CUBE ( { expression | ( expression [, ...] ) } [, ...] )
    GROUPING SETS ( grouping_element [, ...] )

and with_query is:

    with_query_name [ ( column_name [, ...] ) ] AS ( select  )

TABLE [ ONLY ] table_name [ * ]
 */

class Select extends Syntax {
    constructor() {
        super();
        this.columns = [];
        this.from = [];
        this.offset = null;
        this.limit = null;
        this.fetch = null;
    }

    parse(coach) {
        this.parseWith(coach);

        coach.expectWord("select");
        coach.skipSpace();

        this.columns = coach.parseComma("Column");
        this.columns.map(column => this.addChild(column));
        coach.skipSpace();

        this.parseFrom(coach);
        this.parseWhere(coach);
        this.parseGroupBy(coach);
        this.parseHaving(coach);
        this.parseOrderBy(coach);
        this.parseOffsets(coach);
        this.parseUnion(coach);

        this._validate();
    }

    parseWith(coach) {
        if ( !coach.isWord("with") ) {
            return;
        }
        coach.expect(/with\s+/i);

        // [ RECURSIVE ] with_query_name [ ( column_name [, ...] ) ] AS ( select  )
        let queries = coach.parseComma("WithQuery");

        if ( !queries.length ) {
            coach.throwError("expected with_query");
        }
        queries.map(query => this.addChild(query));

        this.with = queries;
        coach.skipSpace();
    }

    parseFrom(coach) {
        if ( !coach.isWord("from") ) {
            this.from = [];
            return;
        }

        coach.expectWord("from");
        coach.skipSpace();

        this.from = coach.parseComma("FromItem");
        this.from.map(item => this.addChild(item));

        coach.skipSpace();
    }

    parseWhere(coach) {
        this.where = null;

        if ( coach.isWord("where") ) {
            coach.readWord();
            coach.skipSpace();

            this.where = coach.parseExpression();
            this.addChild(this.where);

            coach.skipSpace();
        }
    }

    parseGroupBy(coach) {
        if ( !coach.isWord("group") ) {
            return;
        }

        coach.expectWord("group");
        coach.skipSpace();
        coach.expectWord("by");
        coach.skipSpace();

        this.groupBy = coach.parseComma("GroupByElement");
        this.groupBy.map(elem => this.addChild(elem));

        coach.skipSpace();
    }

    parseHaving(coach) {
        this.having = null;
        coach.skipSpace();

        if ( coach.isWord("having") ) {
            coach.readWord();
            coach.skipSpace();

            this.having = coach.parseExpression();
            this.addChild(this.having);

            coach.skipSpace();
        }
    }

    /*
        [ LIMIT { count | ALL } ]
        [ OFFSET start [ ROW | ROWS ] ]
        [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
     */
    parseOffsets(coach) {
        this.offset = null;
        this.limit = null;
        this.fetch = null;

        let hasOffset, hasLimit, hasFetch;

        hasOffset = this.parseOffset(coach);
        hasLimit = this.parseLimit(coach);
        hasFetch = this.parseFetch(coach);

        !hasOffset && this.parseOffset(coach);
        !hasLimit && this.parseLimit(coach);
        !hasFetch && this.parseFetch(coach);

        !hasOffset && this.parseOffset(coach);
        !hasLimit && this.parseLimit(coach);
        !hasFetch && this.parseFetch(coach);

        coach.skipSpace();
    }

    // [ OFFSET start [ ROW | ROWS ] ]
    parseOffset(coach) {
        if ( coach.isWord("offset") ) {
            coach.readWord(); // offset
            coach.skipSpace();

            let start = coach.expect(/\d+/);
            this.offset = +start;

            if ( coach.isWord("rows") ) {
                coach.skipSpace();
                coach.readWord(); // rows
                this.offsetRows = true;
            }
            else if ( coach.isWord("row") ) {
                coach.skipSpace();
                coach.readWord(); // row
                this.offsetRow = true;
            }

            coach.skipSpace();
            return true;
        }
    }

    // [ LIMIT { count | ALL } ]
    parseLimit(coach) {
        this.limit = null;

        if ( coach.isWord("limit") ) {
            coach.readWord(); // limit
            coach.skipSpace();

            let count = coach.expect(/all|\d+/);

            if ( +count === +count ) {
                this.limit = +count;
            }
            else {
                this.limit = "all";
            }

            coach.skipSpace();
            return true;
        }
    }

    // [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
    parseFetch(coach) {
        if ( coach.isWord("fetch") ) {
            coach.readWord(); // fetch
            coach.skipSpace();

            let firstOrNext = coach.expect(/first|next/i).toLowerCase();
            coach.skipSpace();

            let count = null;
            // count ?
            if ( coach.is(/\d/) ); {
                count = +coach.expect(/\d+/);
                if ( count !== count ) { // NaN
                    count = 1;
                }
                coach.skipSpace();
            }

            // { ROW | ROWS } ONLY
            let isRows = false;
            if ( coach.isWord("rows") ) {
                isRows = true;
            }
            coach.expect(/rows?\s+only/i);

            this.fetch = {};
            this.fetch[ firstOrNext ] = true;
            this.fetch.count = count;

            if ( isRows ) {
                this.fetch.rows = true;
            } else {
                this.fetch.row = true;
            }

            coach.skipSpace();
            return true;
        }
    }

    // [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
    parseOrderBy(coach) {
        if ( !coach.isWord("order") ) {
            return;
        }

        coach.expectWord("order");
        coach.skipSpace();
        coach.expectWord("by");
        coach.skipSpace();

        this.orderBy = coach.parseComma("OrderByElement");
        this.orderBy.map(elem => this.addChild(elem));

        coach.skipSpace();
    }

    // [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
    parseUnion(coach) {
        this.union = null;

        if ( !coach.is(/(union|intersect|except)\s+/i) ) {
            return;
        }

        this.union = {};

        // { UNION | INTERSECT | EXCEPT }
        let word = coach.readWord().toLowerCase();
        if ( word == "intersect" ) {
            this.union.intersect = true;
        }
        else if ( word == "except" ) {
            this.union.except = true;
        }
        coach.skipSpace();

        // [ ALL | DISTINCT ]
        if ( coach.isWord("all") ) {
            this.union.all = true;
            coach.readWord();
        }
        else if ( coach.isWord("distinct") ) {
            this.union.distinct = true;
            coach.readWord();
        }
        coach.skipSpace();

        this.union.select = coach.parseSelect();
        this.addChild(this.union.select);
    }

    is(coach) {
        return coach.isWord("select") || coach.isWord("with");
    }

    _validate() {
        // validate from items
        let fromMap = {};

        this.from.forEach(fromItem => {
            this._validateFromItem( fromMap, fromItem );
        });

        // validate with
        let withMap = {};

        this.with && this.with.forEach(query => {
            let name = query.name.word || query.name.content;

            if ( name in withMap ) {
                throw new Error(`WITH query name "${ name }" specified more than once`);
            }

            withMap[ name ] = query;
        });
    }

    _validateFromItem(fromMap, fromItem) {
        let name;

        if ( fromItem.as ) {
            name = fromItem.as;
            name = name.word || name.content;

            if ( name in fromMap ) {
                this._throwFromUniqError(name);
            }

            fromMap[ name ] = fromItem;
        } else {
            if ( fromItem.table ) {
                // from schema1.company, schema2.company

                name = fromItem.table.link.slice(-1)[0]; // last
                name = name.word || name.content;

                if ( !(name in fromMap) ) {
                    fromMap[ name ] = [fromItem];
                } else {
                    let items = fromMap[ name ];
                    if ( !Array.isArray(items) ) {
                        this._throwFromUniqError(name);
                    }

                    let schema = PUBLIC_SCHEMA_NAME;
                    if ( fromItem.table.link.length > 1 ) {
                        schema = fromItem.table.link[ 0 ];
                        schema = schema.word || schema.content;
                    }

                    items.forEach(item => {
                        let itemSchema = PUBLIC_SCHEMA_NAME;
                        if ( item.table.link.length > 1 ) {
                            itemSchema = item.table.link[ 0 ];
                            itemSchema = itemSchema.word || itemSchema.content;
                        }

                        if ( itemSchema == schema ) {
                            this._throwFromUniqError(name);
                        }
                    });

                    items.push( fromItem );
                }
            }
        }
    }

    _throwFromUniqError(name) {
        throw new Error(`table name "${ name }" specified more than once`);
    }

    clone() {
        let clone = new Select();

        if ( this.with ) {
            clone.with = this.with.map(item => item.clone());
            clone.with.map(item => clone.addChild(item));
        }

        clone.columns = this.columns.map(item => item.clone());
        clone.columns.map(item => clone.addChild(item));

        clone.from = this.from.map(item => item.clone());
        clone.from.map(item => clone.addChild(item));

        if ( this.where ) {
            clone.where = this.where.clone();
            clone.addChild(clone.where);
        }

        if ( this.groupBy ) {
            clone.groupBy = this.groupBy.map(item => item.clone());
            clone.groupBy.map(item => clone.addChild(item));
        }

        if ( this.having ) {
            clone.having = this.having.clone();
            clone.addChild(clone.having);
        }

        if ( this.orderBy ) {
            clone.orderBy = this.orderBy.map(item => item.clone());
            clone.orderBy.map(item => clone.addChild(item));
        }

        clone.offset = this.offset;
        if ( this.offsetRows ) {
            clone.offsetRows = true;
        }
        else if ( this.offsetRow ) {
            clone.offsetRow = true;
        }

        clone.limit = this.limit;

        if ( this.fetch ) {
            clone.fetch = {};

            if ( this.fetch.first ) {
                clone.fetch.first = true;
            }
            else if ( this.fetch.next ) {
                clone.fetch.next = true;
            }

            clone.fetch.count = this.fetch.count;

            if ( this.fetch.rows ) {
                clone.fetch.rows = true;
            }
            else if ( this.fetch.row ) {
                clone.fetch.row = true;
            }
        }

        if ( this.union ) {
            clone.union = {};

            if ( this.union.intersect ) {
                clone.union.intersect = true;
            }
            else if ( this.union.expect ) {
                clone.union.expect = true;
            }

            if ( this.union.all ) {
                clone.union.all = true;
            }
            else if ( this.union.distinct ) {
                clone.union.distinct = true;
            }

            clone.union.select = this.union.select.clone();
            clone.addChild(clone.union.select);
        }

        return clone;
    }

    toString() {
        let out = "";

        if ( this.with ) {
            out += "with ";
            out += this.with.map(item => item.toString()).join(", ");
            out += " ";
        }

        out += "select ";
        out += this.columns.map(item => item.toString()).join(", ");
        out += " ";

        if ( this.from.length ) {
            out += "from ";
            out += this.from.map(item => item.toString()).join(", ");
            out += " ";
        }

        if ( this.where ) {
            out += "where ";
            out += this.where.toString();
            out += " ";
        }

        if ( this.groupBy ) {
            out += "group by ";
            out += this.groupBy.map(item => item.toString()).join(", ");
            out += " ";
        }

        if ( this.having ) {
            out += "having ";
            out += this.having.toString();
            out += " ";
        }

        if ( this.orderBy ) {
            out += "order by ";
            out += this.orderBy.map(item => item.toString()).join(", ");
            out += " ";
        }

        if ( this.offset !== null ) {
            out += "offset " + this.offset;

            if ( this.offsetRows ) {
                out += " rows";
            }
            else if ( this.offsetRow ) {
                out += " row";
            }

            out += " ";
        }

        if ( this.limit !== null ) {
            out += "limit " + this.limit;
            out += " ";
        }

        if ( this.fetch ) {
            out += "fetch ";

            if ( this.fetch.first ) {
                out += "first ";
            }
            else if ( this.fetch.next ) {
                out += "next ";
            }

            if ( this.fetch.count !== null ) {
                out += this.fetch.count + " ";
            }

            if ( this.fetch.rows ) {
                out += "rows ";
            }
            else if ( this.fetch.row ) {
                out += "row ";
            }

            out += "only ";
        }

        if ( this.union ) {
            if ( this.union.intersect ) {
                out += "intersect ";
            }
            else if ( this.union.expect ) {
                out += "expect ";
            }
            else {
                out += "union ";
            }

            if ( this.union.all ) {
                out += "all ";
            }
            else if ( this.union.distinct ) {
                out += "distinct ";
            }

            out += this.union.select.toString();
        }

        return out;
    }

    clearColumns() {
        this.columns.forEach(column => {
            this.removeChild(column);
        });
        this.columns = [];
    }

    addColumn(sql) {
        let coach = new this.Coach(sql);
        coach.skipSpace();

        let column = coach.parseColumn(sql);
        this.addChild(column);
        this.columns.push(column);

        return column;
    }

    removeColumn(column) {
        this.removeChild(column);
        let index = this.columns.indexOf(column);
        if ( index != -1 ) {
            this.columns.splice(index, 1);
        }
    }

    clearOffsets() {
        this.offset = null;
        this.limit = null;
        this.fetch = null;
    }

    setLimit(limit) {
        this.limit = limit;
    }

    setOffset(offset) {
        this.offset = offset;
    }

    addFrom(fromItem) {
        if ( typeof fromItem == "string" ) {
            let coach = new this.Coach(fromItem);
            coach.skipSpace();
            fromItem = coach.parseFromItem();
        }

        this.addChild(fromItem);
        this.from.push( fromItem );

        this._validate();
        return fromItem;
    }

    addWhere(sql) {
        if ( this.where ) {
            sql = `( ${ this.where } ) and ${ sql }`;
            this.removeChild( this.where );
        }

        let coach = new this.Coach(sql);
        coach.skipSpace();

        this.where = coach.parseExpression();
        this.addChild(this.where);
    }

    getColumnByAlias(alias) {
        return this.columns.find(column => {
            if ( column.as ) {
                if ( column.as.equalString(alias) ) {
                    return true;
                }
            } else {
                if ( column.expression.isLink() ) {
                    let link = column.expression.getLink();
                    let elem = link.getLast();

                    if ( typeof elem != "string" ) {
                        if ( elem.equalString(alias) ) {
                            return true;
                        }
                    }
                }
            }
        });
    }

    eachFromItem(iteration) {
        let result;

        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[i];
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

    getFromItemByAlias(/* alias */) {
        // let fromItems = this.joins.map(join => join.from).concat(this.from);
        //
        // return fromItems.find(fromItem => {
        //     if ( fromItem.as ) {
        //         if ( fromItem.as.equalString(alias) ) {
        //             return true;
        //         }
        //     }
        //     else if ( fromItem.table ) {
        //         let elem = fromItem.table.getLast();
        //         if ( elem.equalString(alias) ) {
        //             return true;
        //         }
        //     }
        //     else if ( fromItem.file ) {
        //         if ( fromItem.file.equalAlias( alias ) ) {
        //             return true;
        //         }
        //     }
        // });
    }
}

for (let key in removeUnnesaryJoinsMethods) {
    Select.prototype[ key ] = removeUnnesaryJoinsMethods[ key ];
}
for (let key in getColumnSourceMethods) {
    Select.prototype[ key ] = getColumnSourceMethods[ key ];
}
for (let key in buildFromFilesMethods) {
    Select.prototype[ key ] = buildFromFilesMethods[ key ];
}

// stop keywords for alias
Select.keywords = [
    "from",
    "where",
    "select",
    "with",
    "having",
    "offset",
    "limit",
    "fetch",
    "lateral",
    "only",
    "union",
    "intersect",
    "except",
    "order",
    "group",
    // @see joins
    "on",
    "using",
    "left",
    "right",
    "full",
    "inner",
    "cross",
    "join"
];

module.exports = Select;
