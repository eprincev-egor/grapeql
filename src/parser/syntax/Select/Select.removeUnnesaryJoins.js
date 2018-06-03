"use strict";

module.exports = {

    removeUnnesaryJoins({server}) {
        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[i];
            fromItem.removeUnnesaryJoins({ server, select: this });
        }
    },

    _isHelpfullJoin(join, options) {
        let fromLink = join.from.toObjectLink();
        return this._isUsedFromLink(fromLink, options);
    },

    _isUsedFromLink(fromLink, options) {
        options = options || {star: true, checkJoins: true};

        return (
            this._isUsedFromLinkInColumns( fromLink, options ) ||
            this.where && this._isUsedFromLinkInExpresion( fromLink, this.where )  ||
            this.having && this._isUsedFromLinkInExpresion( fromLink, this.having )  ||
            this._isUsedFromLinkInGroupBy( fromLink ) ||
            this._isUsedFromLinkInOrderBy( fromLink ) ||
            this._isUsedFromLinkInWindow( fromLink ) ||

            options.checkJoins && this._isUsedFromLinkInJoins( fromLink )
        );
    },

    _isUsedFromLinkBySubSelect(fromLink) {
        if ( this.isDefinedFromLink(fromLink) ) {
            return false;
        }

        return (
            this._isUsedFromLink(fromLink, {star: false}) ||

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

    _isUsedFromLinkInJoins(fromLink) {
        let isUsed = false;

        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[i];
            fromItem.eachJoin(join => {
                if ( this._isUsedFromLinkInJoin(fromLink, join) ) {
                    isUsed = true;
                    return false;
                }
            });
        }

        return isUsed;
    },

    _isUsedFromLinkInJoin(fromLink, join) {
        let isUsed = false;

        if ( join.on ) {
            isUsed = isUsed || this._isUsedFromLinkInExpresion( fromLink, join.on );
        }

        if ( join.from.select && join.from.lateral ) {
            isUsed = isUsed || join.from.select._isUsedFromLinkBySubSelect(fromLink);
        }

        if ( join.from.functionCall && join.from.lateral ) {
            isUsed = isUsed || join.from.functionCall.arguments.some(expression => (
                this._isUsedFromLinkInExpresion( fromLink, expression )
            ));
        }

        return isUsed;
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

    _isUsedFromLinkInWindow(fromLink) {
        if ( !this.window ) {
            return;
        }

        return this.window.some(item => {
            let isUsed = false;

            if ( item.body.orderBy ) {
                isUsed = isUsed || item.body.orderBy.some(
                    elem => this._isUsedFromLinkInExpresion(fromLink, elem.expression)
                );
            }

            if ( item.body.partitionBy ) {
                isUsed = isUsed || item.body.partitionBy.some(
                    expression => this._isUsedFromLinkInExpresion(fromLink, expression)
                );
            }

            return isUsed;
        });
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
                return this._isUsedFromLinkInExpresion(fromLink, elem);
            }

            if ( elem instanceof ObjectLink ) {
                return elem.containLink( fromLink );
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
                let result;
                result = elem.arguments.some(
                    arg => this._isUsedFromLinkInExpresion(fromLink, arg)
                );
                if ( elem.orderBy ) {
                    result = result || elem.orderBy.some(elem => (
                        this._isUsedFromLinkInExpresion(fromLink, elem.expression)
                    ));
                }
                if ( elem.within ) {
                    result = result || elem.within.some(elem => (
                        this._isUsedFromLinkInExpresion(fromLink, elem.expression)
                    ));
                }
                if ( elem.where ) {
                    result = result || this._isUsedFromLinkInExpresion(fromLink, elem.where);
                }
                if ( elem.over ) {
                    if ( elem.over.partitionBy ) {
                        result = result || elem.over.partitionBy.some(expression => (
                            this._isUsedFromLinkInExpresion(fromLink, expression)
                        ));
                    }

                    if ( elem.over.orderBy ) {
                        result = result || elem.over.orderBy.some(elem => (
                            this._isUsedFromLinkInExpresion(fromLink, elem.expression)
                        ));
                    }
                }
                return result;
            }

            if ( elem instanceof Select ) {
                return elem._isUsedFromLinkBySubSelect( fromLink );
            }
        });
    }
};
