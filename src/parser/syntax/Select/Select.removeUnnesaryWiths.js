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

            if ( !fromItem.table ) {
                return;
            }

            if ( fromItem.table.link.length != 1 ) {
                return;
            }

            let tableName = fromItem.table.first();
            if ( tableName.equal(withQuery.name) ) {
                isUsed = true;
            }
        });

        if ( !isUsed && checkWith && this.with ) {
            isUsed = isUsed || this.with.some(childWith => (
                childWith.select._isUsedWith({
                    withQuery
                })
            ));
        }

        return isUsed;
    }
};
