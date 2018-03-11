"use strict";

const {
    objectLink2schmeTable,
    objectLink2schmeTableColumn,
    equalTableLink
} = require("./helpers");

// TODO: from lateral func( some.id )

module.exports = {
    
    // params.server
    removeUnnesaryJoins(params) {
        for (let i = this.joins.length - 1; i >= 0; i--) {
            let join = this.joins[ i ];
            
            if ( !this._isHelpfullJoin(join, i, params) ) {
                this.joins.splice(i, 1);
            }
        }
        
        this._createFromMap();
    },
    
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
    },
    
    _isUsedFromLink(fromLink, joinIndex, options) {
        options = options || {star: true};
        
        return (
            this._isUsedFromLinkInColumns( fromLink, options ) ||
            this.where && this._isUsedFromLinkInExpresion( fromLink, this.where )  ||
            this.having && this._isUsedFromLinkInExpresion( fromLink, this.having )  ||
            this._isUsedFromLinkInJoins( fromLink, joinIndex ) ||
            this._isUsedFromLinkInGroupBy( fromLink ) ||
            this._isUsedFromLinkInOrderBy( fromLink ) 
        );
    },
    
    _isUsedFromLinkBySubSelect(fromLink) {
        return (
            this._isUsedFromLink(fromLink, -1, {star: false}) ||
            
            this.from.some(fromItem => {
                if ( fromItem.select ) {
                    return fromItem.select._isUsedFromLinkBySubSelect(fromLink);
                }
            }) 
            ||
            
            this.with && this.with.some(
                withElem => withElem.select._isUsedFromLinkBySubSelect(fromLink)
            ) 
            ||
            
            this.union && this.union.select._isUsedFromLinkBySubSelect(fromLink)
        );
    },
    
    _isUsedFromLinkInColumns(fromLink, options) {
        return this.columns.some(column => {
            // select *
            if ( options.star !== false && column.isStar() ) {
                let objectLink = column.expression.getLink();
                if ( objectLink.link.length == 1 ) {
                    return true;
                }
            }
            
            return this._isUsedFromLinkInExpresion( fromLink, column.expression );
        });
    },
    
    _isUsedFromLinkInJoins(fromLink, joinIndex) {
        let afterJoins = this.joins.slice(joinIndex + 1);
        return afterJoins.some(join => {
            let isUsed = false;
            
            if ( join.on ) {
                isUsed = isUsed || this._isUsedFromLinkInExpresion( fromLink, join.on );
            }
            
            if ( join.from.select && join.from.lateral ) {
                isUsed = isUsed || join.from.select._isUsedFromLinkBySubSelect(fromLink);
            }
            return isUsed;
        }) ;
    },
    
    _isUsedFromLinkInGroupBy(fromLink) {
        if ( !this.groupBy ) {
            return false;
        }
        
        return this.groupBy.some(
            elem => this._isUsedFromLinkInGroupByElem(fromLink, elem)
        );
    },
    
    _isUsedFromLinkInGroupByElem(fromLink, groupByElem) {
        if ( groupByElem.expression ) {
            return this._isUsedFromLinkInExpresion( 
                fromLink, 
                groupByElem.expression 
            );
        }
        if ( groupByElem.groupingSets ) {
            return groupByElem.groupingSets.some(
                subElem => this._isUsedFromLinkInGroupByElem(fromLink, subElem)
            );
        }
        if ( groupByElem.rollup || groupByElem.cube ) {
            let elems = groupByElem.rollup || groupByElem.cube;
            
            return elems.some(subElem => {
                if ( Array.isArray(subElem) ) {
                    return subElem.some(
                        elem => this._isUsedFromLinkInExpresion(fromLink, elem)
                    );
                } else {
                    return this._isUsedFromLinkInExpresion(fromLink, subElem);
                }
            });
        }
    },
    
    _isUsedFromLinkInOrderBy(fromLink) {
        if ( !this.orderBy ) {
            return false;
        }
        
        return this.orderBy.some(elem => this._isUsedFromLinkInExpresion(fromLink, elem.expression));
    },
    
    _isUsedFromLinkInExpresion(fromLink, expression) {
        const Expression = this.Coach.Expression;
        const ObjectLink = this.Coach.ObjectLink;
        const Cast = this.Coach.Cast;
        const In = this.Coach.In;
        const Between = this.Coach.Between;
        const CaseWhen = this.Coach.CaseWhen;
        const FunctionCall = this.Coach.FunctionCall;
        
        return expression.elements.some(elem => {
            if ( elem instanceof Expression ) {
                return this._isUsedFromLinkInExpresion(fromLink, expression);
            }
            
            if ( elem instanceof ObjectLink ) {
                let link = objectLink2schmeTableColumn( elem );
                
                return equalTableLink(fromLink, link);
            }
            
            if ( elem instanceof Cast ) {
                return this._isUsedFromLinkInExpresion(fromLink, elem.expression);
            }
            
            if ( elem instanceof In ) {
                if ( Array.isArray(elem.in) ) {
                    return elem.in.some(
                        expression => this._isUsedFromLinkInExpresion(
                            fromLink, 
                            expression
                        )
                    );
                } else {
                    // in (select ...)
                    return elem.in._isUsedFromLinkBySubSelect( fromLink );
                }
            }
            
            if ( elem instanceof Between ) {
                return (
                    this._isUsedFromLinkInExpresion(fromLink, elem.start) ||
                    this._isUsedFromLinkInExpresion(fromLink, elem.end)
                );
            }
            
            if ( elem instanceof CaseWhen ) {
                let result;
                if ( elem.else ) {
                    result = this._isUsedFromLinkInExpresion(fromLink, elem.else);
                }
                if ( result === true ) {
                    return true;
                }
                
                return elem.case.some(caseElem => (
                    this._isUsedFromLinkInExpresion(fromLink, caseElem.when) ||
                    this._isUsedFromLinkInExpresion(fromLink, caseElem.then)
                ));
            }
            
            if ( elem instanceof FunctionCall ) {
                return elem.arguments.some(
                    arg => this._isUsedFromLinkInExpresion(fromLink, arg)
                );
            }
        });
    }
};