"use strict";

const {
    objectLink2schmeTable,
    objectLink2schmeTableColumn,
    equalTableLink,
    getDbTable
} = require("./helpers");

// TODO: from lateral func( some.id )

function pushConstraintColumns(elems, fromLink, constraintColumns) {
    if (
        elems.length != 3 ||
        elems[1].operator != "="
    )  {
        return;
    }

    let link;
    if ( elems[0].link ) {
        link = objectLink2schmeTableColumn( elems[0] );
        if ( link.table && equalTableLink(link, fromLink) ) {
            constraintColumns.push(link.column);
        }
    }
    if ( elems[2].link ) {
        link = objectLink2schmeTableColumn( elems[2] );
        if ( link.table && equalTableLink(link, fromLink) ) {
            constraintColumns.push(link.column);
        }
    }
}

module.exports = {

    // params.server
    removeUnnesaryJoins(params) {
        for (let i = this.joins.length - 1; i >= 0; i--) {
            let join = this.joins[ i ];

            if ( !this._isHelpfullJoin(join, i, params) ) {
                this.joins.splice(i, 1);
            }
        }

        this._validate();
    },

    _isHelpfullJoin(join, index, params) {
        let fromLink;

        if ( join.from.as ) {
            fromLink = new this.Coach.ObjectLink();
            fromLink.add( join.from.as );
        } else {
            fromLink = join.from.table;
        }
        fromLink = objectLink2schmeTable(fromLink);

        let isRemovable = false;
        if ( join.type == "left join" && join.from.table && join.on ) {
            let isConstraintExpression = true,
                constraintColumns = [],

                elems = [];

            for (let i = 0, n = join.on.elements.length; i < n; i++) {
                let elem = join.on.elements[ i ];

                if ( elem.operator == "or" ) {
                    isConstraintExpression = false;
                    break;
                }

                if ( elem.operator == "and" ) {
                    pushConstraintColumns(elems, fromLink, constraintColumns);
                    elems = [];
                } else {
                    elems.push( elem );
                }
            }
            pushConstraintColumns(elems, fromLink, constraintColumns);

            if ( isConstraintExpression ) {
                let link = objectLink2schmeTable( join.from.table ),
                    dbTable;

                try {
                    dbTable = getDbTable( params.server, link );
                } catch(err) {
                    dbTable = null;
                }

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
        if ( this._isDefinedFromLink(fromLink) ) {
            return false;
        }

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
        const Select = this.Coach.Select;

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

            if ( elem instanceof Select ) {
                return elem._isUsedFromLinkBySubSelect( fromLink );
            }
        });
    },

    _isDefinedFromLink(fromLink) {
        let fromItems = (this.joins || []).map(join => join.from).concat(this.from || []);

        return fromItems.some(fromItem => {
            if ( fromItem.as ) {
                if ( fromLink.scheme ) {
                    return;
                }
                return fromItem.as.equal( fromLink.tableObject );
            }
            else if ( fromItem.table ) {
                let tableLink = objectLink2schmeTable(fromItem.table);
                return equalTableLink( tableLink, fromLink );
            }
        });
    },

    replaceLink(replace, to) {
        let coach;

        if ( typeof replace == "string" ) {
            coach = new this.Coach(replace);
            replace = coach.parseObjectLink().link;
        }

        if ( typeof to == "string" ) {
            coach = new this.Coach(to);
            to = coach.parseObjectLink().link;
        }

        let fromLink = objectLink2schmeTable({link: replace});
        if ( this._isDefinedFromLink(fromLink) ) {
            return;
        }

        if ( this.with ) {
            this.with.forEach(elem => {
                elem.select.replaceLink(replace, to);
            });
        }

        this.columns.forEach(column => {
            column.expression.replaceLink(replace, to);
        });

        if ( this.where ) {
            this.where.replaceLink(replace, to);
        }

        if ( this.having ) {
            this.having.replaceLink(replace, to);
        }

        if ( this.orderBy ) {
            this.orderBy.forEach(elem => {
                elem.expression.replaceLink(replace, to);
            });
        }

        if ( this.groupBy ) {
            return this.groupBy.forEach(groupByElem => {
                this._replaceLinkInGroupByElem(groupByElem, replace, to);
            });
        }

        if ( this.from ) {
            this.from.forEach(fromItem => {
                if ( fromItem.select ) {
                    fromItem.select.replaceLink(replace, to);
                }
                else if ( fromItem.functionCall ) {
                    fromItem.functionCall.arguments.forEach(arg => {
                        arg.replaceLink( replace, to );
                    });
                }
            });
        }

        if ( this.joins ) {
            this.joins.forEach(join => {
                if ( join.on ) {
                    join.on.replaceLink( replace, to );
                }
                if ( join.from.select ) {
                    join.from.select.replaceLink(replace, to);
                }
                else if ( join.from.functionCall ) {
                    join.from.functionCall.arguments.forEach(arg => {
                        arg.replaceLink( replace, to );
                    });
                }
            });
        }
    },

    _replaceLinkInGroupByElem(groupByElem, replace, to) {
        if ( groupByElem.expression ) {
            groupByElem.expression.replaceLink(replace, to);
        }
        if ( groupByElem.groupingSets ) {
            groupByElem.groupingSets.forEach(
                subElem => this._replaceLinkInGroupByElem(subElem, replace, to)
            );
        }
        if ( groupByElem.rollup || groupByElem.cube ) {
            let elems = groupByElem.rollup || groupByElem.cube;

            return elems.some(subElem => {
                if ( Array.isArray(subElem) ) {
                    return subElem.forEach(
                        elem => elem.replaceLink(replace, to)
                    );
                } else {
                    subElem.replaceLink(replace, to);
                }
            });
        }
    }
};
