"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../../src/server/GrapeQL");
const {clearDatabase} = require("../../utils/serverHelpers");
const config = require("../../grapeql.config");

describe("WithAllCommands trigger", () => {
    
    let server;

    beforeEach(async() => {
        // run migration
        let db = new pg.Client(config.db);
        await db.connect();
        await clearDatabase(db, __dirname);

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

    it("with (insert...) insert", async() => {
        let triggersCalls = [];

        class TestInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(TestInsert);
        
        await server.query(`
            with
                inserted as (
                    insert into units 
                        (name)
                    values 
                        ('A'),
                        ('B'),
                        ('C')
                    returning name
                )
            
            insert into units 
                (name)
            
            select
                'Clone ' || inserted.name
            from inserted
        `);

        assert.deepEqual(triggersCalls, [
            {
                id: 1,
                name: "A"
            },
            {
                id: 2,
                name: "Clone A"
            },
            {
                id: 3,
                name: "B"
            },
            {
                id: 4,
                name: "Clone B"
            },
            {
                id: 5,
                name: "C"
            },
            {
                id: 6,
                name: "Clone C"
            }
        ]);
    });

    it("with (insert...), (insert...) insert", async() => {
        let triggersCalls = [];

        class TestInsert {
            getEvents() {
                return {
                    "insert:units": "onInsert"
                };
            }

            async onInsert({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(TestInsert);
        
        await server.query(`
            with
                inserted_1 as (
                    insert into units 
                        (name)
                    values 
                        ('A'),
                        ('B'),
                        ('C')
                    returning name
                ),
                inserted_2 as (
                    insert into units 
                        (name)
                    values 
                        ('1'),
                        ('2'),
                        ('3')
                    returning name
                )
            
            insert into units 
                (name)
            
            select
                inserted_1.name || ':' || inserted_2.name
            from inserted_1, inserted_2
        `);

        assert.deepEqual(triggersCalls, [
            {
                id: 1,
                name: "A"
            },
            {
                id: 2,
                name: "1"
            },
            {
                id: 3,
                name: "A:1"
            },
            {
                id: 4,
                name: "2"
            },
            {
                id: 5,
                name: "A:2"
            },
            {
                id: 6,
                name: "3"
            },
            {
                id: 7,
                name: "A:3"
            },
            {
                id: 8,
                name: "B"
            },
            {
                id: 9,
                name: "B:1"
            },
            {
                id: 10,
                name: "B:2"
            },
            {
                id: 11,
                name: "B:3"
            },
            {
                id: 12,
                name: "C"
            },
            {
                id: 13,
                name: "C:1"
            },
            {
                id: 14,
                name: "C:2"
            },
            {
                id: 15,
                name: "C:3"
            }
        ]);
    });

    it("with (delete...) delete", async() => {
        let triggersCalls = [];

        class TestDelete {
            getEvents() {
                return {
                    "delete:units": "onDelete"
                };
            }

            async onDelete({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(TestDelete);

        await server.query(`
            insert into units 
                (name)
            values
                ('a'),
                ('b'),
                ('c'),

                ('1'),
                ('2'),
                ('3')
        `);
        
        await server.query(`
            with
                deleted as (
                    delete from units
                    where name in ('a', 'b', 'c')
                    returning id
                )
            
            delete from units
            where id not in (select id from deleted)
        `);

        assert.equal(triggersCalls.length, 6);
        
        // deleted rows in with query, must be first in changes stack
        
        // with query
        assert.equal(triggersCalls[0].name, "a");
        assert.equal(triggersCalls[1].name, "b");
        assert.equal(triggersCalls[2].name, "c");
        
        // main delete
        assert.equal(triggersCalls[3].name, "1");
        assert.equal(triggersCalls[4].name, "2");
        assert.equal(triggersCalls[5].name, "3");
    });

    it("with (delete...) delete", async() => {
        let triggersCalls = [];

        class TestDelete {
            getEvents() {
                return {
                    "delete:units": "onDelete"
                };
            }

            async onDelete({row}) {
                triggersCalls.push(row);
            }
        }

        await server.triggers.create(TestDelete);

        await server.query(`
            insert into units 
                (name)
            values
                ('a'),
                ('b'),
                ('c'),

                ('1'),
                ('2'),
                ('3'),

                ('red'),
                ('green'),
                ('blue')
        `);
        
        await server.query(`
            with
                deleted_1 as (
                    delete from units
                    where name in ('a', 'b', 'c')
                    returning id
                ),

                deleted_2 as (
                    delete from units
                    where name in ('1', '2', '3')
                    returning id
                )
            
            delete from units
            where 
                id not in (select id from deleted_1)
                and
                id not in (select id from deleted_2)
        `);

        assert.equal(triggersCalls.length, 9);
        
        // deleted rows in with query, must be first in changes stack
        
        // deleted_1
        assert.equal(triggersCalls[0].name, "a");
        assert.equal(triggersCalls[1].name, "b");
        assert.equal(triggersCalls[2].name, "c");
        
        // deleted_2
        assert.equal(triggersCalls[3].name, "1");
        assert.equal(triggersCalls[4].name, "2");
        assert.equal(triggersCalls[5].name, "3");
        
        // main delete
        assert.equal(triggersCalls[6].name, "red");
        assert.equal(triggersCalls[7].name, "green");
        assert.equal(triggersCalls[8].name, "blue");
    });

    it("with (update...) update", async() => {
        let triggersCalls = [];

        class TestUpdate {
            getEvents() {
                return {
                    "update:units": "onUpdate"
                };
            }

            async onUpdate({row, prev, changes}) {
                triggersCalls.push({
                    row, prev, changes
                });
            }
        }

        await server.triggers.create(TestUpdate);

        await server.query(`
            insert into units 
                (name)
            values
                ('a'),
                ('b'),
                ('c'),

                ('1'),
                ('2'),
                ('3')
        `);
        
        await server.query(`
            with
                updated as (
                    update units set
                        name = name || ':updated'
                    where
                        id in (1,2,3)
                    returning id
                )
            
            update units set
                name = 'test ' || name
            where
                id not in (select id from updated)
        `);

        assert.equal(triggersCalls.length, 6);
        
        // updated rows in with query, must be first in changes stack
        
        // with query
        assert.equal(triggersCalls[0].prev.name, "a");
        assert.equal(triggersCalls[1].prev.name, "b");
        assert.equal(triggersCalls[2].prev.name, "c");

        assert.equal(triggersCalls[0].row.name, "a:updated");
        assert.equal(triggersCalls[1].row.name, "b:updated");
        assert.equal(triggersCalls[2].row.name, "c:updated");

        assert.equal(triggersCalls[0].changes.name, "a:updated");
        assert.equal(triggersCalls[1].changes.name, "b:updated");
        assert.equal(triggersCalls[2].changes.name, "c:updated");
        
        // main update
        assert.equal(triggersCalls[3].prev.name, "1");
        assert.equal(triggersCalls[4].prev.name, "2");
        assert.equal(triggersCalls[5].prev.name, "3");

        assert.equal(triggersCalls[3].row.name, "test 1");
        assert.equal(triggersCalls[4].row.name, "test 2");
        assert.equal(triggersCalls[5].row.name, "test 3");

        assert.equal(triggersCalls[3].changes.name, "test 1");
        assert.equal(triggersCalls[4].changes.name, "test 2");
        assert.equal(triggersCalls[5].changes.name, "test 3");
    });

    it("with (insert...), (update...), (delete...) select...", async() => {
        let triggersCalls = [];

        class TestAllCommands {
            getEvents() {
                return {
                    "insert:units": "onInsert",
                    "update:units": "onUpdate",
                    "delete:units": "onDelete"
                };
            }

            async onInsert({row}) {
                triggersCalls.push({
                    type: "insert",
                    row
                });
            }

            async onUpdate({row, prev, changes}) {
                triggersCalls.push({
                    type: "update",
                    row, prev, changes
                });
            }

            async onDelete({row}) {
                triggersCalls.push({
                    type: "delete",
                    row
                });
            }
        }

        await server.query(`
            insert into units 
                (name)
            values
                ('1'),
                ('2'),
                ('3'),

                ('x'),
                ('y'),
                ('z')
        `);

        await server.triggers.create(TestAllCommands);

        let result = await server.query(`
            with
                inserted as (
                    insert into units 
                        (name)
                    values
                        ('a'),
                        ('b'),
                        ('c')
                    returning name
                ),

                updated as (
                    update units set
                        name = name || ':updated'
                    where name in ('1', '2', '3')
                    returning name
                ),

                deleted as (
                    delete from units
                    where name in ('x', 'y', 'z')
                    returning name
                )
            
            select name
            from inserted

            union all

            select name
            from updated

            union all

            select name
            from deleted
        `);

        assert.deepEqual(triggersCalls, [
            // insert
            {
                type: "insert",
                row: {
                    id: 7,
                    name: "a"
                }
            },
            {
                type: "insert",
                row: {
                    id: 8,
                    name: "b"
                }
            },
            {
                type: "insert",
                row: {
                    id: 9,
                    name: "c"
                }
            },

            // update
            {
                type: "update",
                row: {
                    id: 1,
                    name: "1:updated"
                },
                changes: {
                    name: "1:updated"
                },
                prev: {
                    id: 1,
                    name: "1"
                }
            },
            {
                type: "update",
                row: {
                    id: 2,
                    name: "2:updated"
                },
                changes: {
                    name: "2:updated"
                },
                prev: {
                    id: 2,
                    name: "2"
                }
            },
            {
                type: "update",
                row: {
                    id: 3,
                    name: "3:updated"
                },
                changes: {
                    name: "3:updated"
                },
                prev: {
                    id: 3,
                    name: "3"
                }
            },
            // delete
            {
                type: "delete",
                row: {
                    id: 4,
                    name: "x"
                }
            },
            {
                type: "delete",
                row: {
                    id: 5,
                    name: "y"
                }
            },
            {
                type: "delete",
                row: {
                    id: 6,
                    name: "z"
                }
            }
        ]);
        

        assert.deepEqual(result, [
            // inserted
            {name: "a"},
            {name: "b"},
            {name: "c"},
            // updated
            {name: "1:updated"},
            {name: "2:updated"},
            {name: "3:updated"},
            // deleted
            {name: "x"},
            {name: "y"},
            {name: "z"}
        ]);
    });

});
