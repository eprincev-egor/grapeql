"use strict";

const Syntax = require("./Syntax");

// some(1,2)

class FunctionCall extends Syntax {
    parse(coach) {
        this.function = coach.parseObjectLink();
        this.addChild(this.function);

        coach.skipSpace();
        coach.expect("(");
        coach.skipSpace();

        this.arguments = coach.parseComma("Expression");
        this.arguments.map(arg => this.addChild(arg));

        coach.skipSpace();
        coach.expect(")");
    }

    is(coach) {
        let i = coach.i,
            result = false;

        try {
            coach.parseObjectLink();
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
        return clone;
    }

    toString() {
        let args = this.arguments.map(arg => arg.toString()).join(", ");
        return this.function.toString() + "(" + args + ")";
    }

    getType(params) {
        let argumentsTypes = this.arguments.map(arg => arg.getType( params ));
        let schema = this.function.link[0];
        let name = this.function.link[1];

        if ( !name ) {
            name = schema;
            schema = null;
        }
        name = name.word || name.content;

        if ( name == "coalesce" && !schema ) {
            return argumentsTypes[0];
        }

        if ( schema ) {
            schema = schema.word || schema.content;
        } else {
            schema = "public";
        }

        let dbFunction = params.server.getSchema( schema ).getFunction( name, argumentsTypes );
        if ( !dbFunction ) {
            throw new Error(`function ${ this.function }() does not exist`);
        }

        return dbFunction.returnType;
    }
}

module.exports = FunctionCall;
