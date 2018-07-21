"use strict";

/*
 join_type from_item [ ON join_condition | USING ( join_column [, ...] ) ]

where
    join_type One of
        [ INNER ] JOIN
        LEFT [ OUTER ] JOIN
        RIGHT [ OUTER ] JOIN
        FULL [ OUTER ] JOIN
        CROSS JOIN

 */

const Syntax = require("./Syntax");
const {
    objectLink2schemaTableColumn,
    getDbTable
} = require("../../helpers");

class Join extends Syntax {
    parse(coach) {
        let lateralErrorIndex = coach.i;

        let type = coach.expect(/(((left|right|full)\s+(outer\s+)?)|(inner\s+)?|cross\s+)join\s+/i, "expected join keyword");
        type = type.toLowerCase()
            // remove unnecessary spaces
            .replace(/\s+/g, " ")
            .trim();

        // coach.skipSpace();
        this.type = type;

        this.from = coach.parseFromItem();
        this.addChild(this.from);
        coach.skipSpace();

        if ( this.from.lateral ) {
            if ( type != "join" && type != "left join" && type != "inner join" )  {
                coach.i = lateralErrorIndex;
                coach.throwError("The combining JOIN type must be INNER or LEFT for a LATERAL reference.");
            }
        }

        if ( coach.isWord("on") ) {
            coach.expectWord("on");
            coach.skipSpace();

            this.on = coach.parseExpression();
            this.addChild(this.on);
        }
        else if ( coach.isWord("using") ) {
            coach.expectWord("using");
            coach.skipSpace();

            this.using = coach.parseComma("ObjectLink");
            this.using.map(elem => this.addChild(elem));
        }
        else {
            coach.throwError("expected 'on' or 'using'");
        }
    }

    is(coach) {
        return coach.is(/(left|right|inner|join|full|cross)\s/i);
    }

    clone() {
        let clone = new Join();
        clone.type = this.type;
        clone.from = this.from.clone();
        clone.addChild(clone.from);

        if ( this.on ) {
            clone.on = this.on.clone();
            clone.addChild(clone.on);
        } else {
            clone.using = this.using.map(elem => elem.clone());
            clone.using.map(elem => clone.addChild(elem));
        }

        return clone;
    }

    toString() {
        let out = this.type;

        out += " ";
        out += this.from.toString();

        if ( this.on ) {
            out += " on " + this.on.toString();
        } else {
            out += " using " + this.using.map(elem => elem.toString()).join(", ");
        }

        return out;
    }

    isRemovable({ server }) {
        let fromLink = this.from.toTableLink();

        if (
            this.type == "left join" &&
            this.on &&
            (this.from.table || this.from.file)
        ) {
            let isConstraintExpression = true,
                constraintColumns = [],

                elems = [];

            for (let i = 0, n = this.on.elements.length; i < n; i++) {
                let elem = this.on.elements[ i ];

                if ( elem.operator == "or" ) {
                    isConstraintExpression = false;
                    break;
                }

                if ( elem.operator == "and" ) {
                    pushConstraintColumns(elems, fromLink, constraintColumns);
                    elems = [];
                } else {
                    elems.push( elem );
                }
            }
            pushConstraintColumns(elems, fromLink, constraintColumns);

            if ( isConstraintExpression ) {
                let dbTable;

                try {
                    if ( this.from.file ) {
                        let queryNode = server.queryBuilder.getQueryNodeByFile(this.from.file);
                        dbTable = getDbTable( server, queryNode.select.from[0].table );
                    } else {
                        dbTable = getDbTable( server, this.from.table );
                    }
                } catch(err) {
                    dbTable = null;
                }

                if ( dbTable ) {
                    let _constraintColumns = constraintColumns.sort().join(",");

                    for (let name in dbTable.constraints) {
                        let constraint = dbTable.constraints[ name ];

                        if (
                            (constraint.type == "primary key" ||
                            constraint.type == "unique") &&
                            constraint.columns.sort().join(",") == _constraintColumns
                        ) {
                            return true;
                        }
                    }
                }
            }
        }

        if ( this.type == "left join" && this.from.select ) {
            if (
                // left join (select * from some limit 1)
                this.from.select.limit == 1 ||
                // left join (select 1)
                !this.from.select.from.length
            ) {
                return true;
            }
        }
    }
}

function pushConstraintColumns(elems, fromLink, constraintColumns) {
    if (
        elems.length != 3 ||
        elems[1].operator != "="
    )  {
        return;
    }

    let link;
    if ( elems[0].link ) {
        if ( elems[0].containLink( fromLink ) ) {
            link = objectLink2schemaTableColumn( elems[0] );
            constraintColumns.push(link.column);
        }
    }
    if ( elems[2].link ) {
        if ( elems[2].containLink( fromLink ) ) {
            link = objectLink2schemaTableColumn( elems[2] );
            constraintColumns.push(link.column);
        }
    }
}

module.exports = Join;
