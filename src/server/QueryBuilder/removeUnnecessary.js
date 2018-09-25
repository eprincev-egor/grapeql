"use strict";

const TableLink = require("../../parser/syntax/TableLink");
const WithQuery = require("../../parser/syntax/WithQuery");
const Select = require("../../parser/syntax/Select/Select");
const SelectPlan = require("../../parser/deps/SelectPlan");

function removeUnnecessary({
    server, select, 
    plan,
    // TODO: remove it
    ignoreMissingTable = false
}) {
    if ( !plan ) {
        plan = new SelectPlan({
            select,
            server,
            ignoreMissingTable
        });
        plan.build();
    }
    
    select.from.forEach(fromItem => {
        removeUnnecessaryJoins({
            plan,
            fromItem,
            server, select
        });
    });

    removeUnnecessaryWithes({
        server, 
        select, plan
    });

    plan.fromItems.forEach(from => {
        let subPlan = from.plan;
        if ( !subPlan ) {
            return;
        }


        let subSelect = from.withQuery && from.withQuery.select;
        if ( !subSelect ) {
            return;
        }

        removeUnnecessaryColumns({
            server,
            select: subSelect,
            plan: subPlan,
            parentLinks: from.links
        });

        removeUnnecessary({
            server,
            ignoreMissingTable,
            select: subSelect,
            plan: subPlan
        });
    });
}

function removeUnnecessaryColumns({select, plan, parentLinks}) {
    let toRemove = [];
    plan.columns.forEach(column => {
        let isUsedColumn = parentLinks.some(parentLink => 
            parentLink.name == column.name
        );

        if ( !isUsedColumn ) {
            toRemove.push( column.syntax );
        }
    });

    if ( toRemove.length ) {
        toRemove.forEach(columnSyntax => {
            select.removeColumn( columnSyntax );
        });
        plan.build();
    }
}

function removeUnnecessaryWithes({ select, plan }) {
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
        plan.build();
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


function removeUnnecessaryJoins({
    fromItem, plan,
    server, select,
    checkRemovable = true
}) {
    for (let i = fromItem.joins.length - 1; i >= 0; i--) {
        let join = fromItem.joins[ i ];

        if ( checkRemovable && !join.isRemovable({ server }) ) {
            continue;
        }

        let isUsed = isUsedJoin({
            join,
            plan
        });

        removeUnnecessaryJoins({
            plan,
            fromItem: join.from,
            server, select,
            checkRemovable: isUsed ? true : false
        });

        if ( join.from.joins.length ) {
            continue;
        }

        if ( isUsed ) {
            continue;
        }

        fromItem.joins.splice(i, 1);
        fromItem.removeChild(join);

        // need rebuild plan after remove join
        plan.build();
    }
}

function isUsedJoin({join, plan, rootJoin}) {
    if ( !rootJoin ) {
        rootJoin = join;
    }

    let links = plan.getFromItemLinks( join.from );

    links = links.filter(link => {
        // select *
        if ( !link.syntax ) {
            return true;
        }
        
        // join.on
        // child join.on, etc
        if ( link.syntax.hasParent(rootJoin) ) {
            return false;
        }

        return true;
    });

    if ( links.length ) {
        return true;
    }

    for (let j = 0, n = join.from.joins.length; j < n; j++) {
        let childJoin = join.from.joins[ j ];

        if ( isUsedJoin({join: childJoin, plan, rootJoin: join}) ) {
            return true;
        }
    }

    return false;
}


module.exports = {
    removeUnnecessary
};