"use strict";

const ObjectLink = require("./ObjectLink");

class TableLink extends ObjectLink {
    clone() {
        let clone = new TableLink();
        this.fillClone(clone);
        return clone;
    }
}

module.exports = TableLink;
