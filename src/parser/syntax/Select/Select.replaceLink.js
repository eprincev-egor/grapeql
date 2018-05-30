"use strict";

module.exports = {
    replaceLink(replace, to) {
        if ( typeof replace == "string" ) {
            replace = new this.Coach.ObjectLink(replace);
        }

        if ( typeof to == "string" ) {
            to = new this.Coach.ObjectLink(to);
        }
        
        this.eachLink(replace, (link) => {
            link.replace(replace, to);
        });
    },
    
    eachLink(link, iteration) {
        if ( typeof link == "string" ) {
            link = new this.Coach.ObjectLink(link);
        }

        if ( this.isDefinedFromLink(link) ) {
            return;
        }

        if ( this.with ) {
            this.with.forEach(elem => {
                elem.select.eachLink(link, iteration);
            });
        }

        this.columns.forEach(column => {
            column.expression.eachLink(link, iteration);
        });

        if ( this.where ) {
            this.where.eachLink(link, iteration);
        }

        if ( this.having ) {
            this.having.eachLink(link, iteration);
        }

        if ( this.orderBy ) {
            this.orderBy.forEach(elem => {
                elem.expression.eachLink(link, iteration);
            });
        }

        if ( this.groupBy ) {
            return this.groupBy.forEach(groupByElem => {
                this._eachLinkInGroupByElem(groupByElem, link, iteration);
            });
        }

        if ( this.from ) {
            this.from.forEach(fromItem => {
                fromItem.eachLink(link, iteration);
            });
        }
    },

    _eachLinkInGroupByElem(groupByElem, link, iteration) {
        if ( groupByElem.expression ) {
            groupByElem.expression.eachLink(link, iteration);
        }
        if ( groupByElem.groupingSets ) {
            groupByElem.groupingSets.forEach(
                subElem => this._eachLinkInGroupByElem(subElem, link, iteration)
            );
        }
        if ( groupByElem.rollup || groupByElem.cube ) {
            let elems = groupByElem.rollup || groupByElem.cube;

            return elems.some(subElem => {
                if ( Array.isArray(subElem) ) {
                    return subElem.forEach(
                        elem => elem.eachLink(link, iteration)
                    );
                } else {
                    subElem.eachLink(link, iteration);
                }
            });
        }
    }
};
