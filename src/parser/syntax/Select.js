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

const PUBLIC_SCHEME_NAME = "public";

class Select extends Syntax {
    parse(coach) {
        this.parseWith(coach);
        this._createWithMap();
        
        coach.expectWord("select");
        coach.skipSpace();
        
        this.columns = coach.parseComma("Column");
        this.columns.map(column => this.addChild(column));
        coach.skipSpace();
        
        this.parseFrom(coach);
        this.parseJoins(coach);
        this.parseWhere(coach);
        this.parseGroupBy(coach);
        this.parseHaving(coach);
        this.parseOrderBy(coach);
        this.parseOffsets(coach);
        
        this._createFromMap();
        
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
    
    parseJoins(coach) {
        this.joins = coach.parseChain("Join");
        this.joins.map(join => this.addChild(join));
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
    
    _createFromMap() {
        this._fromMap = {};
        
        this.from.forEach(fromItem => {
            this._addFromItemToMap( fromItem );
        });
        
        this.joins.forEach(join => {
            this._addFromItemToMap( join.from );
        });
    }
    
    _createWithMap() {
        this._withMap = {};
        
        if ( !this.with ) {
            return;
        }
        
        this.with.forEach(query => {
            let name = query.name.word || query.name.content;
            
            if ( name in this._withMap ) {
                throw new Error(`WITH query name "${ name }" specified more than once`);
            }
            
            this._withMap[ name ] = query;
        });
    }
    
    _addFromItemToMap(fromItem) {
        let name;
        
        if ( fromItem.as && fromItem.as.alias ) {
            name = fromItem.as.alias;
            name = name.word || name.content;
            
            if ( name in this._fromMap ) {
                this._throwFromUniqError(name);
            }
            
            this._fromMap[ name ] = fromItem;
        } else {
            // from scheme1.company, scheme2.company
            
            name = fromItem.table.link.slice(-1)[0]; // last
            name = name.word || name.content;
            
            if ( !(name in this._fromMap) ) {
                this._fromMap[ name ] = [fromItem];
            } else {
                let items = this._fromMap[ name ];
                if ( !Array.isArray(items) ) {
                    this._throwFromUniqError(name);
                }
                
                let scheme = PUBLIC_SCHEME_NAME;
                if ( fromItem.table.link.length > 1 ) {
                    scheme = fromItem.table.link[ 0 ];
                    scheme = scheme.word || scheme.content;
                }
                
                items.forEach(item => {
                    let itemScheme = PUBLIC_SCHEME_NAME;
                    if ( item.table.link.length > 1 ) {
                        itemScheme = item.table.link[ 0 ];
                        itemScheme = itemScheme.word || itemScheme.content;
                    }
                    
                    if ( itemScheme == scheme ) {
                        this._throwFromUniqError(name);
                    }
                });
                
                items.push( fromItem );
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
        
        clone.joins = this.joins.map(item => item.clone());
        clone.joins.map(item => clone.addChild(item));
        
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
        
        clone._createFromMap();
        clone._createWithMap();
        
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
        
        out += "from ";
        out += this.from.map(item => item.toString()).join(", ");
        out += " ";
        
        if ( this.joins.length ) {
            out += this.joins.map(item => item.toString()).join(", ");
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
    
    addJoin(sql) {
        let coach = new this.Coach(sql);
        coach.skipSpace();
        let join = coach.parseJoin(sql);
        this.addChild(join);
        this.joins.push(join);
        
        this._createFromMap();
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
    
    // params.server
    // params.node
    getColumnSource(params, objectLink, options) {
        options = options || {};
        let _childFromItem = options._childFromItem;
        
        let link = objectLink2schmeTableColumn( objectLink );
        
        if ( !link.table && options._checkColumns !== false ) {
            let column = this.columns.find(column => {
                let alias = column.as && column.as.alias;
                alias = alias && (alias.word || alias.content);
                
                if ( alias == link.column ) {
                    return true;
                }
            });
            
            if ( column ) {
                if ( column.expression.isLink() ) {
                    objectLink = column.expression.getLink();
                    return this.getColumnSource(params, objectLink, { _checkColumns: false });
                } else {
                    return {expression: column.expression};
                }
            }
        }
        
        let sources = [];
        
        let fromItems = this.from.concat( this.joins.map(join => join.from) );
        for (let i = 0, n = fromItems.length; i < n; i++) {
            let fromItem = fromItems[ i ];
            
            if ( fromItem == _childFromItem ) {
                break;
            }
            
            let source;
            if ( fromItem.table ) {
                source = this._getColumnSourceByFromItem(params, fromItem, link);
            }
            else if ( fromItem.select ) {
                let subLink = new this.Coach.ObjectLink();
                subLink.add( link.columnObject.clone() );
                
                source = fromItem.select.getColumnSource(params, subLink);
            }
            
            if ( source ) {
                sources.push(source);
            }
        }
        
        if ( sources.length === 0 ) {
            let source = this._findSourceByLateal(params, objectLink);
            if ( source ) {
                return source;
            }
            
            if ( options.throwError !== false ) {
                throw new Error(`column "${ link.column }" does not exist`);
            }
        }
        if ( sources.length > 1 ) {
            throw new Error(`column reference "${ link.column }" is ambiguous`);
        }
        
        return sources[0];
    }
    
    _getColumnSourceByFromItem(params, fromItem, link) {
        let from = objectLink2schmeTable(fromItem.table);
        
        if ( link.scheme ) {
            if ( (from.scheme || PUBLIC_SCHEME_NAME) != link.scheme ) {
                return;
            }
        }
        
        if ( link.table ) {
            if ( fromItem.as && fromItem.as.alias ) {
                let alias = fromItem.as.alias;
                alias = alias.word || alias.content;
                
                if ( alias != link.table ) {
                    return;
                }
            }
            
            else if ( from.table != link.table ) {
                return;
            }
        }
        
        if ( !from.scheme ) {
            let source = this._findByWithQuery(params, from, link);
            if ( source ) {
                return source;
            }
        }
        
        
        let dbTable = params.server.schemes[ from.scheme || PUBLIC_SCHEME_NAME ].tables[ from.table ];
        let dbColumn = dbTable.columns[ link.column ];
        
        if ( dbColumn ) {
            return {dbColumn};
        }
    }
    
    _findByWithQuery(params, from, link, _childWithQuery) {
        if ( this.with ) {
            for (let i = 0, n = this.with.length; i < n; i++) {
                let withQuery = this.with[ i ];
                
                if ( withQuery == _childWithQuery ) {
                    break;
                }
                
                let name = withQuery.name;
                name = name.word || name.content;
                
                if ( name == from.table ) {
                    let subLink = new this.Coach.ObjectLink();
                    subLink.add( link.columnObject.clone() );
                    
                    return withQuery.select.getColumnSource(params, subLink, {throwError: false});
                }
            }
        }
        
        let WithQuery = this.Coach.WithQuery;
        let parentWithQuery = this.findParentInstance(WithQuery);
        
        if ( parentWithQuery ) {
            let parentSelect = parentWithQuery.findParentInstance(Select);
            return parentSelect._findByWithQuery(params, from, link, parentWithQuery);
        }
    }
    
    _findSourceByLateal(params, objectLink) {
        let FromItem = this.Coach.FromItem;
        let parentFromItem = this.findParentInstance(FromItem);
        
        if ( !parentFromItem || !parentFromItem.lateral ) {
            return;
        }
        
        let parentSelect = parentFromItem.findParentInstance(Select);
        if ( parentSelect ) {
            return parentSelect.getColumnSource(params, objectLink, {_childFromItem: parentFromItem});
        }
    }
    
    // params.server
    removeUnnesaryJoins(params) {
        for (let i = this.joins.length - 1; i >= 0; i--) {
            let join = this.joins[ i ];
            
            if ( !this._isHelpfullJoin(join, i, params) ) {
                this.joins.splice(i, 1);
            }
        }
        
        this._createFromMap();
    }
    
    _isHelpfullJoin(join, index, params) {
        let fromLink;
        
        if ( join.from.as && join.from.as.alias ) {
            fromLink = new this.Coach.ObjectLink();
            fromLink.add( join.from.as.alias );
        } else {
            fromLink = join.from.table;
        }
        fromLink = objectLink2schmeTable(fromLink);
        
        let isRemovable = false;
        if ( join.type == "left join" && join.from.table && join.on ) {
            let isConstraintExpression = true,
                constraintColumns = [];
            
            for (let i = 0, n = join.on.elements.length; i < n; i += 3) {
                let 
                    leftElem = join.on.elements[ i ],
                    operator = join.on.elements[ i + 1 ],
                    rightElem = join.on.elements[ i + 2 ];
                
                if (
                    operator.operator != "=" ||
                    !leftElem.link ||
                    !rightElem.link
                )  {
                    isConstraintExpression = false;
                    break;
                }
                
                let leftLink = objectLink2schmeTableColumn( leftElem ),
                    rightLink = objectLink2schmeTableColumn( rightElem );
                
                if ( leftLink.table && equalTableLink(leftLink, fromLink) ) {
                    constraintColumns.push(leftLink.column);
                }
                else if ( rightLink.table && equalTableLink(rightLink, fromLink) ) {
                    constraintColumns.push(rightLink.column);
                }
                else {
                    isConstraintExpression = false;
                    break;
                }
                
                let nextElem = join.on.elements[ i + 3 ];
                if ( nextElem ) {
                    if ( nextElem.operator != "and" ) {
                        isConstraintExpression = false;
                        break;
                    }
                    i++;
                }
            }
            
            if ( isConstraintExpression ) {
                let server = params.server,
                    link = objectLink2schmeTable( join.from.table ),
                    scheme = link.scheme || "public",
                    table = link.table,
                    dbScheme = server.schemes[ scheme ],
                    dbTable = dbScheme && dbScheme.tables[ table ];
                
                if ( dbTable ) {
                    let _constraintColumns = constraintColumns.sort().join(",");
                    
                    for (let name in dbTable.constraints) {
                        let constraint = dbTable.constraints[ name ];
                        
                        if ( 
                            (constraint.type == "primary key" || 
                            constraint.type == "unique") &&
                            constraint.columns.sort().join(",") == _constraintColumns
                        ) {
                            isRemovable = true;
                            break;
                        }
                    }
                }
            }
        }
        if ( join.type == "left join" && join.from.select ) {
            if ( 
                // left join (select * from some limit 1)
                join.from.select.limit == 1 || 
                // left join (select 1)
                !join.from.select.from.length
            ) {
                isRemovable = true;
            }
        }
        
        // join can change rows order
        if ( !isRemovable ) {
            return true;
        }
        
        return this._isUsedFromLink(fromLink, index);
    }
    
    _isUsedFromLink(fromLink, joinIndex) {
        let afterJoins = this.joins.slice(joinIndex + 1);
        return (
            this.columns.some(column => {
                // select *
                if ( column.isStar() ) {
                    let objectLink = column.expression.getLink();
                    if ( objectLink.link.length == 1 ) {
                        return true;
                    }
                }
                
                return this._isUsedFromLinkInExpresion( fromLink, column.expression );
            })
            ||
            
            this.where && this._isUsedFromLinkInExpresion( fromLink, this.where ) 
            ||
            
            this.having && this._isUsedFromLinkInExpresion( fromLink, this.having ) 
            ||
            
            afterJoins.some(join => {
                let isUsed = false;
                
                if ( join.on ) {
                    isUsed = isUsed || this._isUsedFromLinkInExpresion( fromLink, join.on );
                }
                
                if ( join.from.select && join.from.lateral ) {
                    // TODO: deepScan union and with and from all items
                    isUsed = isUsed || join.from.select._isUsedFromLinkBySubSelect(fromLink);
                }
                return isUsed;
            }) 
            ||
            
            this._isUsedFromLinkInGroupBy( fromLink ) ||
            this._isUsedFromLinkInOrderBy( fromLink ) 
        );
    }
    
    _isUsedFromLinkBySubSelect(fromLink) {
        return (
            this._isUsedFromLink(fromLink, -1) 
            ||
            
            this.from.some(fromItem => {
                if ( fromItem.select ) {
                    return fromItem.select._isUsedFromLinkBySubSelect(fromLink);
                }
            })
        );
    }
    
    _isUsedFromLinkInGroupBy(/* fromLink */) {
        return false;
    }
    
    _isUsedFromLinkInOrderBy(/* fromLink */) {
        return false;
    }
    
    _isUsedFromLinkInExpresion(fromLink, expression) {
        const Expression = this.Coach.Expression;
        const ObjectLink = this.Coach.ObjectLink;
        
        return expression.elements.some(elem => {
            if ( elem instanceof Expression ) {
                return this._isUsedFromLinkInExpresion(fromLink, expression);
            }
            
            if ( elem instanceof ObjectLink ) {
                let link = objectLink2schmeTableColumn( elem );
                
                return equalTableLink(fromLink, link);
            }
        });
    }
}

function equalTableLink(leftLink, rightLink) {
    return (
        // scheme can be null
        leftLink.scheme == rightLink.scheme &&
        leftLink.table == rightLink.table
    );
}

function objectLink2schmeTable(objectLink) {
    let scheme = objectLink.link[0];
    let table = objectLink.link[1];
    
    if ( !table ) {
        table = scheme;
        scheme = null;
    }
    
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }
    
    if ( table ) {
        table = table.word || table.content;
    }
    
    return {table, scheme};
}

function objectLink2schmeTableColumn(objectLink) {
    let scheme = objectLink.link[0];
    let table = objectLink.link[1];
    let column = objectLink.link[2];
    
    if ( !column ) {
        column = table;
        table = scheme;
        scheme = null;
    }
    
    if ( !column ) {
        column = table;
        table = null;
        scheme = null;
    }
    
    if ( scheme ) {
        scheme = scheme.word || scheme.content;
    }
    
    if ( table ) {
        table = table.word || table.content;
    }
    
    let columnObject = column;
    column = column.word || column.content;
    
    return {scheme, table, column, columnObject};
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
