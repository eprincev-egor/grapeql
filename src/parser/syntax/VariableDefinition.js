"use strict";

const ColumnDefinition = require("./ColumnDefinition");

class VariableDefinition extends ColumnDefinition {
    parseName(coach) {
        this.name = coach.parseSystemVariable();
        this.addChild(this.name);
        coach.skipSpace();
    }

    parseElement(coach) {
        this.parseNotNull(coach);
        this.parseCheck(coach);
        this.parseDefault(coach);
    }

    is(coach) {
        return coach.isSystemVariable();
    }
}

module.exports = VariableDefinition;
