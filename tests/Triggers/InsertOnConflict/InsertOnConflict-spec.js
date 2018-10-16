"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("InsertOnConflict trigger", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);
        await db.end();

        // run server
        config.http = false;
        server = await GrapeQL.start( config );
    });

    afterEach(async() => {
        if ( !server ) {
            return;
        }

        await server.stop();
        server = null;
    });


    it("Insert on conflict, check update trigger and insert trigger", async() => {
        let triggersCalls = [];

        class Trigger {
            getEvents() {
                return {
                    "insert:units": "onInsert",
                    "update:units": "onUpdate"
                };
            }

            async onInsert({row, type}) {
                triggersCalls.push({
                    type,
                    row
                });
            }

            async onUpdate({row, type, prev, changes}) {
                triggersCalls.push({
                    type,
                    row,
                    prev,
                    changes
                });
            }
        }

        await server.triggers.create(Trigger);
        let rows;

        rows = await server.query(`
            insert into units
                (id, id_order, name)
            values
                (1, 1, 'red'),
                (2, 1, 'green')
            on conflict (id)
            do update set
                name = excluded.name
        `);

        assert.deepEqual(rows, [
            {id: 1, id_order: 1, name: "red"},
            {id: 2, id_order: 1, name: "green"}
        ]);
        
        assert.deepEqual(triggersCalls, [
            {
                type: "insert",
                row: {id: 1, id_order: 1, name: "red"}
            },
            {
                type: "insert",
                row: {id: 2, id_order: 1, name: "green"}
            }
        ]);


        triggersCalls = [];
        rows = await server.query(`
            insert into units
                (id, id_order, name)
            values
                (2, 1, 'green:updated'),
                (3, 1, 'blue')
            on conflict (id)
            do update set
                name = excluded.name
        `);

        assert.deepEqual(rows, [
            {id: 2, id_order: 1, name: "green:updated"},
            {id: 3, id_order: 1, name: "blue"}
        ]);
        
        assert.deepEqual(triggersCalls, [
            {
                type: "update",
                row: {id: 2, id_order: 1, name: "green:updated"},
                prev: {id: 2, id_order: 1, name: "green"},
                changes: {name: "green:updated"}
            },
            {
                type: "insert",
                row: {id: 3, id_order: 1, name: "blue"}
            }
        ]);
        
    });

    it("with delete ... insert ... select on conflict, check triggers", async() => {
        let triggersCalls = [];

        class Trigger {
            getEvents() {
                return {
                    "insert:units": "onInsert",
                    "update:units": "onUpdate",
                    "delete:units": "onDelete"
                };
            }

            async onInsert({row, type}) {
                triggersCalls.push({
                    type,
                    row
                });
            }

            async onDelete({row, type}) {
                triggersCalls.push({
                    type,
                    row
                });
            }

            async onUpdate({row, type, prev, changes}) {
                triggersCalls.push({
                    type,
                    row,
                    prev,
                    changes
                });
            }
        }

        await server.triggers.create(Trigger);

        await server.query(`
            insert into units
                (id_order, name)
            values
                (1, 'red'),
                (1, 'green'),
                (1, 'blue')
        `);

        await server.query(`
            insert into units
                (id_order, name)
            values
                (2, 'test')
        `);

        triggersCalls = [];
        let rows = await server.query(`
            with 
                deleted as (
                    delete from units
                    where id_order = 1
                    returning name
                )
            
            insert into units
                (id, id_order, name)
            
            select
                row_number() over() + 3,
                2,
                deleted.name
            from deleted
            
            on conflict (id)
            
            do update set
                name = excluded.name
            
            returning 
                xmax, *
        `);
        
        assert.ok(
            rows[0].xmax &&
            rows[0].xmax != "0"
        );
        assert.equal(rows[0].id, 4);
        assert.equal(rows[0].id_order, 2);
        assert.equal(rows[0].name, "red");

        assert.deepEqual(rows[1], {
            id: 5,
            id_order: 2,
            name: "green",
            xmax: "0"
        });

        assert.deepEqual(rows[2], {
            id: 6,
            id_order: 2,
            name: "blue",
            xmax: "0"
        });

        assert.deepEqual(triggersCalls, [
            {
                type: "delete",
                row: {
                    id: 1,
                    name: "red",
                    id_order: 1
                }
            },
            {
                type: "update",
                row: {
                    id: 4,
                    name: "red",
                    id_order: 2
                },
                prev: {
                    id: 4,
                    name: "test",
                    id_order: 2
                },
                changes: {
                    name: "red"
                }
            },
            {
                type: "delete",
                row: {
                    id: 2,
                    name: "green",
                    id_order: 1
                }
            },
            {
                type: "insert",
                row: {
                    id: 5,
                    name: "green",
                    id_order: 2
                }
            },
            {
                type: "delete",
                row: {
                    id: 3,
                    name: "blue",
                    id_order: 1
                }
            },
            {
                type: "insert",
                row: {
                    id: 6,
                    name: "blue",
                    id_order: 2
                }
            }
        ]);
    });

    it("with insert on conflict", async() => {
        let triggersCalls = [];

        class Trigger {
            getEvents() {
                return {
                    "insert:units": "onInsert",
                    "update:units": "onUpdate"
                };
            }

            async onInsert({row, type}) {
                triggersCalls.push({
                    type,
                    row
                });
            }

            async onUpdate({row, type, prev, changes}) {
                triggersCalls.push({
                    type,
                    row,
                    prev,
                    changes
                });
            }
        }

        await server.triggers.create(Trigger);

        await server.query(`
            insert into units
                (id_order, name)
            values
                (1, 'X');
        `);

        triggersCalls = [];
        let row = await server.query(`
            with
                inserted as (
                    insert into units
                        (id, id_order, name)
                    values
                        (1, 1, 'Y'),
                        (2, 1, 'Z')
                    
                    on conflict (id)
                    do update set
                        name = excluded.name
                    
                    returning name
                )
            select row
                string_agg( name, ', ' ) as names
            from inserted
        `);

        assert.deepEqual(row, {
            names: "Y, Z"
        });
    
        assert.deepEqual(triggersCalls, [
            {
                type: "update",
                row: {
                    id: 1,
                    id_order: 1,
                    name: "Y"
                },
                prev: {
                    id: 1,
                    id_order: 1,
                    name: "X"
                },
                changes: {
                    name: "Y"
                }
            },
            {
                type: "insert",
                row: {
                    id: 2,
                    id_order: 1,
                    name: "Z"
                }
            }
        ]);

    });
});
