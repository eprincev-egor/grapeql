"use strict";

const Column = require("../../parser/syntax/Column");
const ColumnLink = require("../../parser/syntax/ColumnLink");
const TableLink = require("../../parser/syntax/TableLink");
const FromItem = require("../../parser/syntax/FromItem");
const Join = require("../../parser/syntax/Join");
const WithQuery = require("../../parser/syntax/WithQuery");
const Select = require("../../parser/syntax/Select/Select");

function removeUnnecessary({server, select}) {
    removeUnnecessaryJoins({server, select});
    removeUnnecessaryWithes({server, select});
}

function removeUnnecessaryJoins({server, select}) {
    for (let i = 0, n = select.from.length; i < n; i++) {
        let fromItem = select.from[i];

        removeUnnecessaryJoins_byFromItem({
            fromItem,
            server, select
        });
    }
}

function isHelpfulJoin(select, join, options) {
    let fromLink = join.from.toTableLink();
    return isUsedFromLink(select, fromLink, options);
}

function isUsedFromLink(select, fromLink, options) {
    options = options || {
        star: true,
        checkJoins: true,
        startChild: false
    };

    let isUsed = false;

    let child = options.startChild || select;

    child.walk((child, walker) => {
        if ( child instanceof Column ) {
            // select *
            if ( child.parent == select && child.isStar() ) {
                let columnLink = child.expression.getLink();
                if ( columnLink.link.length == 1 ) {
                    isUsed = true;
                    walker.stop();
                }
            }
        }

        else if ( child instanceof ColumnLink ) {
            if ( child.containLink( fromLink ) ) {
                isUsed = true;
                walker.stop();
            }
        }

        else if ( child instanceof Select ) {
            if ( child.isDefinedFromLink(fromLink) ) {
                walker.skip();
            }
        }

        else if ( child instanceof FromItem ) {
            if ( !child.lateral && child.parent instanceof Join ) {
                walker.skip();
            }

            else if ( options.checkJoins === false ) {
                let childSelect = child.findParentInstance(Select);
                if ( select == childSelect ) {
                    walker.skip();
                }
            }
        }
    });

    return isUsed;
}

function removeUnnecessaryWithes({ select }) {
    if ( !select.with ) {
        return;
    }

    for (let n = select.with.queriesArr.length, i = n - 1; i >= 0; i--) {
        let withQuery = select.with.queriesArr[ i ];

        if (
            hasTableLink({
                select,
                startChild: select,
                withQuery,
                checkWith: false
            })
        ) {
            continue;
        }

        let isUsedInNextWithes = false;
        for (let j = i + 1; j < n; j++) {
            let nextWithQuery = select.with.queriesArr[ j ];

            isUsedInNextWithes = (
                isUsedInNextWithes ||
                hasTableLink({
                    select,
                    startChild: nextWithQuery,
                    withQuery 
                })
            );

            if ( isUsedInNextWithes ) {
                break;
            }
        }

        if ( isUsedInNextWithes ) {
            continue;
        }

        select.with.removeChild(withQuery);
        select.with.queriesArr.splice(i, 1);
        delete select.with.queries[ withQuery.name.toLowerCase() ];
        n--;
    }

    if ( select.with.isEmpty() ) {
        select.removeChild(select.with);
        delete select.with;
    }
}

function hasTableLink({
    select,
    startChild,
    withQuery,
    checkWith = true
}) {
    let hasTableLink = false;

    startChild.walk((child, walker) => {
        if ( child instanceof Select ) {
            if ( hasWith(child, withQuery.name) ) {
                walker.skip();
            }
        }

        if ( child instanceof TableLink ) {
            if ( child.link.length == 1 ) {
                let tableName = child.first();
                if ( tableName.equal(withQuery.name) ) {
                    hasTableLink = true;

                    walker.stop();
                }
            }
        }
        else if ( child instanceof WithQuery ) {
            if ( checkWith === false ) {
                let childSelect = child.findParentInstance(Select);
                if ( select == childSelect ) {
                    walker.skip();
                }
            }
        }
    });

    return hasTableLink;
}

function hasWith(select, name) {
    return select.with && select.with.queriesArr.some(
        withQuery => withQuery.name.equal(name)
    );
}


function removeUnnecessaryJoins_byFromItem({
    fromItem,
    server, select,
    checkRemovable = true
}) {
    for (let i = fromItem.joins.length - 1; i >= 0; i--) {
        let join = fromItem.joins[ i ];

        if ( checkRemovable && !join.isRemovable({ server }) ) {
            continue;
        }

        let fromLink = join.from.toTableLink();
        let isUsedJoin = (
            isHelpfulJoin(select, join, {checkJoins: false}) ||
            isUsedFromLinkAfter({
                fromItem, 
                select, 
                fromLink, i
            }) ||
            isUsedChildJoins({
                fromItem: join.from,
                select, fromLink,
                rootFrom: fromItem, 
                i
            })
        );

        removeUnnecessaryJoins_byFromItem({
            fromItem: join.from,
            server, select,
            checkRemovable: isUsedJoin ? true : false
        });

        if ( join.from.joins.length ) {
            continue;
        }

        if ( isUsedJoin ) {
            continue;
        }

        fromItem.joins.splice(i, 1);
        fromItem.removeChild(join);
    }
}

function isUsedFromLinkAfter({fromItem, select, fromLink, i}) {
    i++;
    for (let n = fromItem.joins.length; i < n; i++) {
        let nextJoin = fromItem.joins[ i ];

        if ( isUsedFromLink(select, fromLink, {startChild: nextJoin}) ) {
            return true;
        }

        if ( isUsedFromLinkAfter({
            fromItem: nextJoin.from,
            select,
            fromLink,
            i: -1
        }) ) {
            return true;
        }
    }
}

function isUsedChildJoins({fromItem, select, fromLink, rootFrom, i}) {
    for (let j = 0, n = fromItem.joins.length; j < n; j++) {
        let join = fromItem.joins[ j ];

        if ( isHelpfulJoin(select, join, {checkJoins: false}) ) {
            return true;
        }

        if ( 
            isUsedFromLinkAfter({
                fromItem: rootFrom,
                select, fromLink, i
            }) 
        ) {
            return true;
        }

        if ( isUsedChildJoins({
            fromItem: join.from,
            select, fromLink,
            rootFrom, i
        }) ) {
            return true;
        }
    }
}


module.exports = {
    removeUnnecessary, 
    isHelpfulJoin
};