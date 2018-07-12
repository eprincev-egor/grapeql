"use strict";

const FromItem = require("../../parser/syntax/FromItem");
const Join = require("../../parser/syntax/Join");
const Select = require("../../parser/syntax/Select/Select");
const ObjectName = require("../../parser/syntax/ObjectName");
const ObjectLink = require("../../parser/syntax/ObjectLink");
const ColumnLink = require("../../parser/syntax/ColumnLink");
const With = require("../../parser/syntax/With");

function buildFromFiles({ 
    queryManager, 
    select 
}) {
    select.removeUnnesaryJoins({ server: queryManager.server });
    select.removeUnnesaryWiths({ server: queryManager.server });

    let fileItems = [];
    select.walk(child => {
        if (
            child instanceof FromItem &&
                child.file
        ) {
            fileItems.push( child );
        }
    });
    if ( !fileItems.length ) {
        return;
    }

    fileItems.forEach(fileItem => {
        let select = fileItem.findParentInstance(Select);
        buildFromFile({
            select,
            queryManager,
            fromItem: fileItem
        });
    });

    buildFromFiles({ queryManager, select });
}

function buildFromFile({ select, queryManager, fromItem }) {
    let isJoin = fromItem.parent instanceof Join;
    let isManyFrom = (
        fromItem.parent instanceof Select &&
            fromItem.parent.from.length > 1
    );

    let queryNode = queryManager.getQueryNodeByFile(fromItem.file);
    let nodeSelect = queryNode.select;
    let nodeFrom = nodeSelect.from[0];

    let oldNodeAlias = nodeFrom.getAliasSql();
    let newNodeAlias = fromItem.as || fromItem.file.toObjectName();

    fromItem.clear({ joins: false });
    nodeFrom.fillClone(fromItem, { joins: false });
    fromItem.as = newNodeAlias;

    let joins = [];
    for (let j = 0, m = nodeFrom.joins.length; j < m; j++) {
        let join = nodeFrom.joins[ j ];
        join = join.clone();

        let oldAlias = join.from.getAliasSql();
        let newAliasWithoutQuotes;
        if ( isJoin || isManyFrom ) {
            newAliasWithoutQuotes = `${ trimQuotes( newNodeAlias.toString() ) }.${ trimQuotes( oldAlias ) }`;
        } else {
            newAliasWithoutQuotes = `${ trimQuotes( oldAlias ) }`;
        }

        let newAlias;
        if ( /^\w+$/.test(newAliasWithoutQuotes) ) {
            newAlias = newAliasWithoutQuotes;
        } else {
            newAlias = `"${ newAliasWithoutQuotes }"`;
        }

        join.from.as = new ObjectName(newAlias);

        if ( oldAlias != newAlias ) {
            join.replaceLink(oldAlias, newAlias);
            select.replaceLink(newAliasWithoutQuotes, newAlias);
        }
        join.replaceLink(oldNodeAlias, newNodeAlias);


        if ( isJoin || isManyFrom ) {
            select.replaceLink(`${ newNodeAlias.toString() }.${ trimQuotes( oldAlias ) }`, newAlias);
        } else {
            if ( newAlias != oldAlias ) {
                select.replaceLink(`${ trimQuotes( oldAlias ) }`, newAlias);
            }
        }

        joins.push({
            join,
            oldAlias,
            newAlias
        });
    }

    let prevJoin = false;
    for (let i = 0, n = joins.length; i < n; i++) {
        let {
            join,
            oldAlias,
            newAlias
        } = joins[ i ];

        fromItem.addJoinAfter(join, prevJoin);
        prevJoin = join;

        for (let j = i + 1; j < n; j++) {
            let nextJoin = joins[ j ].join;

            nextJoin.replaceLink(oldAlias, newAlias);
        }
    }

    nodeSelect.columns.forEach(column => {
        if ( !column.as ) {
            return;
        }

        let link = new ObjectLink(`${ newNodeAlias.toString() }.${ trimQuotes( column.as.toString() ) }`);
        let expression = column.expression.clone();
        expression.replaceLink(oldNodeAlias, newNodeAlias);

        select.walk(child => {
            if ( !(child instanceof ColumnLink) ) {
                return;
            }

            if ( child.equalLink(link) ) {
                child.parent.replaceElement(child, expression.clone());
            }
        });
    });

    if ( nodeSelect.with ) {
        if ( !select.with ) {
            select.with = new With();
        }
        nodeSelect.with.queriesArr.forEach(withQuery => {
            withQuery = withQuery.clone();
            let oldName = withQuery.name;
            let newName = `"${ trimQuotes( newNodeAlias.toString() ) }.${ trimQuotes( oldName.toString() ) }"`;
            newName = new ObjectName(newName);
            withQuery.name = newName;

            select.with.queriesArr.push(withQuery);
            select.with.queries[ newName.toLowerCase() ] = withQuery;
            select.with.addChild(withQuery);

            if ( nodeSelect.with.recursive ) {
                select.with.recursive = true;
            }

            select.eachFromItem(fromItem => {
                if ( !fromItem.table ) {
                    return;
                }

                if ( fromItem.table.link.length != 1 ) {
                    return;
                }

                if ( fromItem.table.first().equal(oldName) ) {
                    fromItem.table.clear();
                    fromItem.table.unshift( newName.clone() );
                }
            });
        });
    }
}

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}

function checkCircularDeps({
    queryNode,
    queryManager,
    map
}) {
    if ( !map ) {
        map = [];
    }

    queryNode.select.walk(child => {
        if ( !(child instanceof FromItem) ) {
            return;
        }

        let fromItem = child;
        if ( !fromItem.file ) {
            return;
        }

        if ( fromItem.parent instanceof Join ) {
            let join = fromItem.parent;
            if ( 
                join.isRemovable({
                    server: queryManager.server
                }) 
            ) {
                return;
            }
        }
        let newQueryNode = queryManager.getQueryNodeByFile(fromItem.file);
        let nodeSelect = newQueryNode.select;

        if ( map.includes(nodeSelect) ) {
            throw new Error("circular dependency");
        }

        checkCircularDeps({
            queryManager,
            queryNode: newQueryNode,
            map: map.concat([nodeSelect]),
            select: nodeSelect
        });
    });
}

module.exports = function mainBuildFromFiles({ 
    queryManager,
    queryNode,
    select
}) {
    checkCircularDeps({ 
        queryNode,
        queryManager
    });

    buildFromFiles({ 
        queryManager,
        select 
    });
};
