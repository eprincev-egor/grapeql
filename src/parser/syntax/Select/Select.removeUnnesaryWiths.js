"use strict";

module.exports = {
    removeUnnesaryWiths() {
        if ( !this.with ) {
            return;
        }

        for (let n = this.with.length, i = n - 1; i >= 0; i--) {
            let withQuery = this.with[ i ];

            if ( this._isUsedWith({withQuery, checkWith: false}) ) {
                continue;
            }

            let isUsedInNextWiths = false;
            for (let j = i + 1; j < n; j++) {
                let nextWithQuery = this.with[ j ];

                isUsedInNextWiths = (
                    isUsedInNextWiths ||
                    nextWithQuery.select._isUsedWith({ withQuery })
                );

                if ( isUsedInNextWiths ) {
                    break;
                }
            }

            if ( isUsedInNextWiths ) {
                continue;
            }

            this.with.splice(i, 1);
            n--;
        }
    },

    _isUsedWith({withQuery, checkWith = true}) {
        let isUsed = false;

        this.eachFromItem(fromItem => {
            if ( isUsed ) {
                return;
            }

            if ( fromItem.table && fromItem.table.link.length == 1 ) {
                let tableName = fromItem.table.first();
                if ( tableName.equal(withQuery.name) ) {
                    isUsed = true;
                }
                return;
            }

            if ( fromItem.select ) {
                isUsed = isUsed || fromItem.select._isUsedWithBySubSelect( withQuery );
                return;
            }

            if ( fromItem.functionCall ) {
                isUsed = isUsed || this._isUsedWithInFunctionCall(
                    fromItem.functionCall,
                    withQuery
                );
                return;
            }
        });

        if ( !isUsed && checkWith && this.with ) {
            isUsed = isUsed || this.with.some(childWith => (
                childWith.select._isUsedWith({
                    withQuery
                })
            ));
        }

        isUsed = isUsed || (
            this._isUsedWithInColumns( withQuery ) ||
            this.where && this._isUsedWithInExpresion( withQuery, this.where )  ||
            this.having && this._isUsedWithInExpresion( withQuery, this.having )  ||
            this._isUsedWithInGroupBy( withQuery ) ||
            this._isUsedWithInOrderBy( withQuery ) ||
            this._isUsedWithInWindow( withQuery )
        );

        return isUsed;
    },

    _isUsedWithInColumns(withQuery) {
        return this.columns.some(column => {
            return this._isUsedWithInExpresion( withQuery, column.expression );
        });
    },

    _isUsedWithInExpresion(withQuery, expression) {
        const Expression = this.Coach.Expression;
        const Cast = this.Coach.Cast;
        const In = this.Coach.In;
        const Between = this.Coach.Between;
        const CaseWhen = this.Coach.CaseWhen;
        const FunctionCall = this.Coach.FunctionCall;
        const Select = this.Coach.Select;

        return expression.elements.some(elem => {
            if ( elem instanceof Expression ) {
                return this._isUsedWithInExpresion(withQuery, elem);
            }

            if ( elem instanceof Cast ) {
                return this._isUsedWithInExpresion(withQuery, elem.expression);
            }

            if ( elem instanceof In ) {
                if ( Array.isArray(elem.in) ) {
                    return elem.in.some(
                        expression => this._isUsedWithInExpresion(
                            withQuery,
                            expression
                        )
                    );
                } else {
                    // in (select ...)
                    return elem.in._isUsedWithBySubSelect( withQuery );
                }
            }

            if ( elem instanceof Between ) {
                return (
                    this._isUsedWithInExpresion(withQuery, elem.start) ||
                    this._isUsedWithInExpresion(withQuery, elem.end)
                );
            }

            if ( elem instanceof CaseWhen ) {
                let result;
                if ( elem.else ) {
                    result = this._isUsedWithInExpresion(withQuery, elem.else);
                }
                if ( result === true ) {
                    return true;
                }

                return elem.case.some(caseElem => (
                    this._isUsedWithInExpresion(withQuery, caseElem.when) ||
                    this._isUsedWithInExpresion(withQuery, caseElem.then)
                ));
            }

            if ( elem instanceof FunctionCall ) {
                return this._isUsedWithInFunctionCall(elem, withQuery);
            }

            if ( elem instanceof Select ) {
                return elem._isUsedWithBySubSelect( withQuery );
            }
        });
    },

    _isUsedWithInFunctionCall(funcCall, withQuery) {
        let result;
        result = funcCall.arguments.some(
            arg => this._isUsedWithInExpresion(withQuery, arg)
        );
        if ( funcCall.orderBy ) {
            result = result || funcCall.orderBy.some(elem => (
                this._isUsedWithInExpresion(withQuery, elem.expression)
            ));
        }
        if ( funcCall.within ) {
            result = result || funcCall.within.some(elem => (
                this._isUsedWithInExpresion(withQuery, elem.expression)
            ));
        }
        if ( funcCall.where ) {
            result = result || this._isUsedWithInExpresion(withQuery, funcCall.where);
        }
        if ( funcCall.over ) {
            if ( funcCall.over.partitionBy ) {
                result = result || funcCall.over.partitionBy.some(expression => (
                    this._isUsedWithInExpresion(withQuery, expression)
                ));
            }

            if ( funcCall.over.orderBy ) {
                result = result || funcCall.over.orderBy.some(elem => (
                    this._isUsedWithInExpresion(withQuery, elem.expression)
                ));
            }
        }
        return result;
    },

    _isUsedWithInGroupBy(withQuery) {
        if ( !this.groupBy ) {
            return false;
        }

        return this.groupBy.some(
            elem => this._isUsedWithInGroupByElem(withQuery, elem)
        );
    },

    _isUsedWithInGroupByElem(withQuery, groupByElem) {
        if ( groupByElem.expression ) {
            return this._isUsedWithInExpresion(
                withQuery,
                groupByElem.expression
            );
        }
        if ( groupByElem.groupingSets ) {
            return groupByElem.groupingSets.some(
                subElem => this._isUsedWithInGroupByElem(withQuery, subElem)
            );
        }
        if ( groupByElem.rollup || groupByElem.cube ) {
            let elems = groupByElem.rollup || groupByElem.cube;

            return elems.some(subElem => {
                if ( Array.isArray(subElem) ) {
                    return subElem.some(
                        elem => this._isUsedWithInExpresion(withQuery, elem)
                    );
                } else {
                    return this._isUsedWithInExpresion(withQuery, subElem);
                }
            });
        }
    },

    _isUsedWithInOrderBy(withQuery) {
        if ( !this.orderBy ) {
            return false;
        }

        return this.orderBy.some(elem => this._isUsedWithInExpresion(withQuery, elem.expression));
    },

    _isUsedWithInWindow(withQuery) {
        if ( !this.window ) {
            return;
        }

        return this.window.some(item => {
            let isUsed = false;

            if ( item.body.orderBy ) {
                isUsed = isUsed || item.body.orderBy.some(
                    elem => this._isUsedWithInExpresion(withQuery, elem.expression)
                );
            }

            if ( item.body.partitionBy ) {
                isUsed = isUsed || item.body.partitionBy.some(
                    expression => this._isUsedWithInExpresion(withQuery, expression)
                );
            }

            return isUsed;
        });
    },

    _isUsedWithBySubSelect(withQuery) {
        return this._isUsedWith({withQuery});
    }
};
