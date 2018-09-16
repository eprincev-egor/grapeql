"use strict";

const Syntax = require("./Syntax");

// some(1,2)

class FunctionCall extends Syntax {
    parse(coach) {
        this.function = coach.parseFunctionLink();
        this.addChild(this.function);

        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();

        if ( coach.isWord("all") ) {
            coach.expectWord("all");
            coach.skipSpace();

            this.all = true;
        }
        else if ( coach.isWord("distinct") ) {
            coach.expectWord("distinct");
            coach.skipSpace();

            this.distinct = true;
        }

        if ( coach.is("*") ) {
            coach.i++;
            coach.skipSpace();
            this.isStar = true;
            this.arguments = [];
        } else {
            this.arguments = coach.parseComma("Expression");
            this.arguments.map(arg => this.addChild(arg));
        }

        coach.skipSpace();

        // aggregate_name (expression [ , ... ] [ order_by_clause ] )
        if ( coach.isWord("order") ) {
            this.orderBy = this.parseOrderBy(coach);
        }

        coach.skipSpace();
        coach.expect(")");
        coach.skipSpace();

        if ( coach.isWord("within") ) {
            coach.expectWord("within");
            coach.skipSpace();

            coach.expectWord("group");
            coach.skipSpace();

            coach.expect("(");
            coach.skipSpace();

            this.within = this.parseOrderBy(coach);

            coach.skipSpace();
            coach.expect(")");
        }

        coach.skipSpace();

        if ( coach.isWord("filter") ) {
            coach.expectWord("filter");
            coach.skipSpace();

            coach.expect("(");
            coach.skipSpace();

            coach.expectWord("where");
            coach.skipSpace();

            this.where = coach.parseExpression();
            this.addChild(this.where);

            coach.skipSpace();
            coach.expect(")");
        }

        if ( coach.isWord("over") ) {
            coach.expectWord("over");
            coach.skipSpace();

            coach.expect("(");
            coach.skipSpace();

            if ( coach.is(")") ) {
                this.over = null;
            } else {
                this.over = coach.parseWindowDefinition();
                this.addChild(this.over);
            }

            coach.skipSpace();
            coach.expect(")");
        }
    }

    parseOrderBy(coach) {
        coach.expectWord("order");
        coach.skipSpace();
        coach.expectWord("by");
        coach.skipSpace();

        let orderBy = coach.parseComma("OrderByElement");
        orderBy.map(elem => this.addChild(elem));

        return orderBy;
    }

    is(coach) {
        let i = coach.i,
            result = false;

        try {
            coach.parseFunctionLink();
            coach.skipSpace();
            result = coach.is("(");
        } catch(err) {
            result = false;
        }

        coach.i = i;
        return result;
    }

    clone() {
        let clone = new FunctionCall();

        clone.function = this.function.clone();
        clone.addChild(this.function);

        clone.arguments = this.arguments.map(arg => arg.clone());
        clone.arguments.map(arg => clone.addChild(arg));

        if ( this.isStar ) {
            clone.isStar = true;
        }
        if ( this.all ) {
            clone.all = true;
        }
        if ( this.distinct ) {
            clone.distinct = true;
        }

        if ( this.within ) {
            clone.within = this.within.map(item => item.clone());
            clone.within.map(item => clone.addChild(item));
        }

        if ( this.orderBy ) {
            clone.orderBy = this.orderBy.map(item => item.clone());
            clone.orderBy.map(item => clone.addChild(item));
        }

        if ( this.where ) {
            clone.where = this.where.clone();
            clone.addChild(clone.where);
        }

        if ( this.over === null ) {
            clone.over = null;
        }

        if ( this.over ) {
            clone.over = this.over.clone();
            clone.addChild(clone.over);
        }

        return clone;
    }

    toString() {
        let out = "";

        out += this.function.toString();
        out += "(";

        if ( this.all ) {
            out += " all ";
        }
        if ( this.distinct ) {
            out += " distinct ";
        }

        if ( this.isStar ) {
            out += "*";
        } else {
            out += this.arguments.map(arg => arg.toString()).join(", ");
        }

        if ( this.orderBy ) {
            out += " order by ";
            out += this.orderBy.map(item => item.toString()).join(", ");
            out += " ";
        }

        out += ")";

        if ( this.within ) {
            out += " within group ( order by ";
            out += this.within.map(item => item.toString()).join(", ");
            out += " ) ";
        }

        if ( this.where ) {
            out += "filter (where ";
            out += this.where.toString();
            out += ")";
        }

        if ( this.over ) {
            out += "over ( ";
            out += this.over.toString();
            out += ")";
        }

        if ( this.over === null ) {
            out += "over()";
        }

        return out;
    }

    getType(params) {
        let argumentsTypes = this.arguments.map(arg => arg.getType( params ));
        let schema = this.function.link[0];
        let name = this.function.link[1];

        if ( !name ) {
            name = schema;
            schema = null;
        }
        name = name.toLowerCase();

        if ( name == "coalesce" && !schema ) {
            return argumentsTypes[0];
        }

        if ( schema ) {
            schema = schema.toLowerCase();
        }

        let dbFunction = params.server.database.getFunction({ schema, name, argumentsTypes });
        
        if ( !dbFunction ) {
            throw new Error(`function ${ this.function }() does not exist`);
        }

        return dbFunction.returnType;
    }
}

module.exports = FunctionCall;
