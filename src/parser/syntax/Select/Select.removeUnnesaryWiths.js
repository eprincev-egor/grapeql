"use strict";

module.exports = {
    removeUnnesaryWiths() {
        if ( !this.with ) {
            return;
        }

        for (let n = this.with.queriesArr.length, i = n - 1; i >= 0; i--) {
            let withQuery = this.with.queriesArr[ i ];

            if (
                this._hasTableLink({
                    startChild: this,
                    withQuery,
                    checkWith: false
                })
            ) {
                continue;
            }

            let isUsedInNextWiths = false;
            for (let j = i + 1; j < n; j++) {
                let nextWithQuery = this.with.queriesArr[ j ];

                isUsedInNextWiths = (
                    isUsedInNextWiths ||
                    this._hasTableLink({
                        startChild: nextWithQuery,
                        withQuery 
                    })
                );

                if ( isUsedInNextWiths ) {
                    break;
                }
            }

            if ( isUsedInNextWiths ) {
                continue;
            }

            this.with.removeChild(withQuery);
            this.with.queriesArr.splice(i, 1);
            delete this.with.queries[ withQuery.name.toLowerCase() ];
            n--;
        }

        if ( this.with.isEmpty() ) {
            this.removeChild(this.with);
            delete this.with;
        }
    },

    _hasTableLink({
        startChild,
        withQuery,
        checkWith = true
    }) {
        let hasTableLink = false;

        startChild.walk((child, wallker) => {
            if ( child instanceof this.Coach.Select ) {
                if ( child._hasWith(withQuery.name) ) {
                    wallker.skip();
                }
            }

            if ( child instanceof this.Coach.TableLink ) {
                if ( child.link.length == 1 ) {
                    let tableName = child.first();
                    if ( tableName.equal(withQuery.name) ) {
                        hasTableLink = true;

                        wallker.stop();
                    }
                }
            }
            else if ( child instanceof this.Coach.WithQuery ) {
                if ( checkWith === false ) {
                    let select = child.findParentInstance(this.Coach.Select);
                    if ( select == this ) {
                        wallker.skip();
                    }
                }
            }
        });

        return hasTableLink;
    },

    _hasWith(name) {
        return this.with && this.with.queriesArr.some(
            withQuery => withQuery.name.equal(name)
        );
    }
};
