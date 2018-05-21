"use strict";

module.exports = {
    replaceLink(replace, to) {
        let coach;

        if ( typeof replace == "string" ) {
            coach = new this.Coach(replace);
            replace = coach.parseObjectLink();
        }

        if ( typeof to == "string" ) {
            coach = new this.Coach(to);
            to = coach.parseObjectLink();
        }

        if ( this.isDefinedFromLink(replace) ) {
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
                fromItem.replaceLink(replace, to);
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
