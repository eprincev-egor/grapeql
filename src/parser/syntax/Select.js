"use strict";
const Syntax = require("./Syntax");

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
    parse(coach) {
        this.parseWith(coach);
        
        coach.expectWord("select");
        coach.skipSpace();
        
        this.columns = coach.parseComma("Column");
        coach.skipSpace();
        
        this.parseFrom(coach);
        this.parseJoins(coach);
        this.parseWhere(coach);
        this.parseGroupBy(coach);
        this.parseHaving(coach);
        this.parseOrderBy(coach);
        this.parseOffsets(coach);
        
        this.parseUnion(coach);
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
        
        this.with = queries;
        coach.skipSpace();
    }
    
    parseFrom(coach) {
        coach.expectWord("from");
        coach.skipSpace();
        
        this.from = coach.parseComma("FromItem");
        
        coach.skipSpace();
    }
    
    parseJoins(coach) {
        this.joins = coach.parseChain("Join");
    }
    
    parseWhere(coach) {
        this.where = null;
        
        if ( coach.isWord("where") ) {
            coach.readWord();
            coach.skipSpace();
            this.where = coach.parseExpression();
            
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
        
        coach.skipSpace();
    }
    
    parseHaving(coach) {
        this.having = null;
        coach.skipSpace();
        
        if ( coach.isWord("having") ) {
            coach.readWord();
            coach.skipSpace();
            this.having = coach.parseExpression();
            
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
                
            if ( coach.isWord("row") || coach.isWord("rows") ) {
                coach.skipSpace();
                coach.readWord(); // row || rows
            }
            
            coach.skipSpace();
            return true;
        }
    }
    
    // [ LIMIT { count | ALL } ]
    parseLimit(coach) {
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
            
            let firstOrNext = coach.expect(/first|next/i);
            coach.skipSpace();
            
            let count = 1;
            // count ?
            if ( coach.is(/\d/) ); {
                count = +coach.expect(/\d+/);
                if ( count !== count ) { // NaN
                    count = 1;
                }
                coach.skipSpace();
            }
            
            // { ROW | ROWS } ONLY
            coach.expect(/rows?\s+only/i);
            
            this.fetch = {};
            this.fetch[ firstOrNext ] = count;
            
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
    }
    
    is(coach) {
        return coach.isWord("select") || coach.isWord("with");
    }
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
