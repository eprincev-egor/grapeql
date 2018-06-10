"use strict";

const {getNode} = require("./helpers");

module.exports = {
    buildFromFiles({ server }) {
        checkCircularDeps({select: this, server});
        this._buildFromFiles({ server });
    },

    _buildFromFiles({ server }) {
        this.removeUnnesaryJoins({ server });
        this.removeUnnesaryWiths({ server });

        let fileItems = [];
        this.walk(child => {
            if (
                child instanceof this.Coach.FromItem &&
                child.file
            ) {
                fileItems.push( child );
            }
        });
        if ( !fileItems.length ) {
            return;
        }

        fileItems.forEach(fileItem => {
            let select = fileItem.findParentInstance(this.Coach.Select);
            select._buildFromFile({
                server,
                fromItem: fileItem
            });
        });

        this._buildFromFiles({ server });
    },

    _buildFromFile({ server, fromItem }) {
        const ObjectName = this.Coach.ObjectName;
        const Join = this.Coach.Join;
        const Select = this.Coach.Select;

        let isJoin = fromItem.parent instanceof Join;
        let isManyFrom = (
            fromItem.parent instanceof Select &&
            fromItem.parent.from.length > 1
        );

        let node = getNode(fromItem.file, server);
        let nodeSelect = node.parsed;
        let nodeFrom = node.parsed.from[0];

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
                this.replaceLink(newAliasWithoutQuotes, newAlias);
            }
            join.replaceLink(oldNodeAlias, newNodeAlias);


            if ( isJoin || isManyFrom ) {
                this.replaceLink(`${ newNodeAlias.toString() }.${ trimQuotes( oldAlias ) }`, newAlias);
            } else {
                if ( newAlias != oldAlias ) {
                    this.replaceLink(`${ trimQuotes( oldAlias ) }`, newAlias);
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

            let link = new this.Coach.ObjectLink(`${ newNodeAlias.toString() }.${ trimQuotes( column.as.toString() ) }`);
            let expression = column.expression.clone();
            expression.replaceLink(oldNodeAlias, newNodeAlias);

            this.walk(child => {
                if ( !(child instanceof this.Coach.ColumnLink) ) {
                    return;
                }

                if ( child.equalLink(link) ) {
                    child.parent.replaceElement(child, expression.clone());
                }
            });
        });

        if ( nodeSelect.with ) {
            if ( !this.with ) {
                this.with = [];
            }
            nodeSelect.with.forEach(withQuery => {
                withQuery = withQuery.clone();
                let oldName = withQuery.name;
                let newName = `"${ trimQuotes( newNodeAlias.toString() ) }.${ trimQuotes( oldName.toString() ) }"`;
                newName = new ObjectName(newName);
                withQuery.name = newName;

                this.with.push(withQuery);

                if ( nodeSelect.withRecursive ) {
                    this.withRecursive = true;
                }

                this.eachFromItem(fromItem => {
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
};

function trimQuotes(str) {
    return str.replace(/^"|"$/g, "");
}

function checkCircularDeps({
    select,
    server,
    map
}) {
    if ( !map ) {
        map = [];
    }

    select.walk(child => {
        if ( !(child instanceof select.Coach.FromItem) ) {
            return;
        }

        let fromItem = child;
        if ( !fromItem.file ) {
            return;
        }

        if ( fromItem.parent instanceof select.Coach.Join ) {
            let join = fromItem.parent;
            if ( join.isRemovable({server}) ) {
                return;
            }
        }

        let node = getNode(fromItem.file, server);
        let nodeSelect = node.parsed;

        if ( map.includes(nodeSelect) ) {
            throw new Error("circular dependency");
        }

        checkCircularDeps({
            server,
            map: map.concat([select]),
            select: nodeSelect
        });
    });
}
