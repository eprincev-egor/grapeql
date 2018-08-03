"use strict";

class DbConstraint {
    constructor({
        name, 
        type, 
        columns,
        // fk info
        onUpdate,
        onDelete,
        referenceTable,
        referenceColumns
    }) {
        this.name = name;
        this.type = type;
        this.columns = columns;
        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
        this.referenceTable = referenceTable;
        this.referenceColumns = referenceColumns;
    }
}

module.exports = DbConstraint;
