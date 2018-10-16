"use strict";

const assert = require("assert");
const pg = require("pg");
const GrapeQL = require("../../src/server/GrapeQL");
const {clearDatabase} = require("../utils/serverHelpers");
const config = require("../grapeql.config");

function checkSyntaxError(err, subText) {
    err = err || new Error("empty");

    if ( err.message.endsWith(subText) ) {
        assert.ok(true);
    }
    else {
        assert.equal(false, err.message);
    }
}

describe("CustomReturning", () => {
    
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

    ///
    /// SELECT
    ///
    
    it("`select *` returning array of objects", async() => {

        let rows = await server.query(`
            select *
            from company
        `);

        assert.deepEqual(rows, [
            {
                id: 1,
                name: "Red",
                inn: "123"
            },
            {
                id: 2,
                name: "Green",
                inn: "456"
            }
        ]);
    });

    it("`select row *` returning object", async() => {

        let row = await server.query(`
            select row *
            from company
            where id = 1
        `);

        assert.deepEqual(row, {
            id: 1,
            name: "Red",
            inn: "123"
        });
    });

    it("`select value id` returning value", async() => {

        let id = await server.query(`
            select value id
            from company
            where id = 1
        `);

        assert.deepEqual(id, 1);
    });

    it("`select value id` returning null, when not found row", async() => {

        let row = await server.query(`
            select value id
            from company
            where id = 3
        `);

        assert.deepEqual(row, null);
    });

    it("`select value id, name` error: select value should contain only one column", async() => {
        let err;
        try {
            await server.query(`
                select value id, name
                from company
                where id = 3
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError(err, "select value should contain only one column");
    });

    it("`select value * from company` error: select value can't use with star", async() => {
        let err;
        try {
            await server.query(`
                select value *
                from company
                where id = 3
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError(err, "select value can't use with star");
    });

    it("`select value company.* from company` error: select value can't use with star", async() => {
        let err;
        try {
            await server.query(`
                select value company.*
                from company
                where id = 3
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "select value can't use with star" );
    });

    it("`select value from company` error: select value should have one column", async() => {
        let err;
        try {
            await server.query(`
                select value 
                from company
                where id = 3
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "select value should have one column" );
    });

    it("`select row * from company` error: select row should return only one row", async() => {
        let err;
        try {
            await server.query(`
                select row *
                from company
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "select row should return only one row" );
    });

    ///
    /// INSERT
    ///
    
    it("`insert ... returning *` returning array of objects", async() => {

        let rows = await server.query(`
            insert into company
                (name, inn)
            values
                ('Yellow', '777'),
                ('Pink',   '888')
            returning *
        `);

        assert.deepEqual(rows, [
            {
                id: 3,
                name: "Yellow",
                inn: "777"
            },
            {
                id: 4,
                name: "Pink",
                inn: "888"
            }
        ]);
    });

    it("`insert ... returning row *` returning object", async() => {

        let row = await server.query(`
            insert into company
                (name, inn)
            values
                ('Yellow', '777')
            returning row *
        `);

        assert.deepEqual(row, {
            id: 3,
            name: "Yellow",
            inn: "777"
        });
    });

    it("`insert row ` returning object", async() => {

        let row = await server.query(`
            insert row into company
                (name, inn)
            values
                ('Yellow', '777')
        `);

        assert.deepEqual(row, {
            id: 3,
            name: "Yellow",
            inn: "777"
        });
    });

    it("`insert ... returning value ` returning value", async() => {

        let id = await server.query(`
            insert into company
                (name, inn)
            values
                ('Yellow', '777')

            returning value id
        `);

        assert.deepEqual(id, 3);
    });

    it("`insert row ... returning ` error: insert row should be without returning clause", async() => {
        let err;

        try {
            await server.query(`
                insert row into company
                    (name, inn)
                values
                    ('Yellow', '777')
                returning *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "insert row should be without returning clause");
    });

    it("`insert ... returning value *` error: returning value can't use with star", async() => {
        let err;

        try {
            await server.query(`
                insert into company
                    (name, inn)
                values
                    ('Yellow', '777')
                returning value *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value can't use with star");
    });

    it("`insert ... returning value ` error: returning value should have one column", async() => {
        let err;

        try {
            await server.query(`
                insert into company
                    (name, inn)
                values
                    ('Yellow', '777')
                returning value
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value should have one column");
    });

    it("`insert ... returning row ` error: returning row should have one column", async() => {
        let err;

        try {
            await server.query(`
                insert into company
                    (name, inn)
                values
                    ('Yellow', '777')
                returning row
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning row should have one column");
    });


    it("`insert ... returning row *` error: insert row should return only one row", async() => {
        let err;
        try {
            await server.query(`
                insert into company
                    (name, inn)
                values
                    ('Yellow', '777'),
                    ('Pink',   '888')
                returning row *
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "insert row should return only one row" );
    });

    ///
    /// DELETE
    ///
    
    it("`delete ... returning *` returning array of objects", async() => {

        let rows = await server.query(`
            delete from company
            returning *
        `);

        assert.deepEqual(rows, [
            {
                id: 1,
                name: "Red",
                inn: "123"
            },
            {
                id: 2,
                name: "Green",
                inn: "456"
            }
        ]);
    });

    it("`delete ... returning row *` returning object", async() => {

        let row = await server.query(`
            delete from company
            where id = 1
            returning row *
        `);

        assert.deepEqual(row, {
            id: 1,
            name: "Red",
            inn: "123"
        });
    });

    it("`delete row ` returning object", async() => {

        let row = await server.query(`
            delete row from company
            where id = 1
        `);

        assert.deepEqual(row, {
            id: 1,
            name: "Red",
            inn: "123"
        });
    });

    it("`delete ... returning value ` returning value", async() => {

        let id = await server.query(`
            delete from company
            where name = 'Red'
            returning value id
        `);

        assert.deepEqual(id, 1);
    });

    it("`delete row ... returning ` error: insert row should be without returning clause", async() => {
        let err;

        try {
            await server.query(`
                delete row from company
                returning *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "delete row should be without returning clause");
    });

    it("`delete ... returning value *` error: returning value can't use with star", async() => {
        let err;

        try {
            await server.query(`
                delete from company
                returning value *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value can't use with star");
    });

    it("`delete ... returning value ` error: returning value should have one column", async() => {
        let err;

        try {
            await server.query(`
                delete from company
                returning value
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value should have one column");
    });

    it("`delete ... returning row ` error: returning row should have one column", async() => {
        let err;

        try {
            await server.query(`
                delete from company
                returning row
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning row should have one column");
    });

    it("`delete ... returning row *` error: delete row should return only one row", async() => {
        let err;
        try {
            await server.query(`
                delete from company
                returning row *
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "delete row should return only one row" );
    });

    ///
    /// UPDATE
    ///
    
    it("`update ... returning *` returning array of objects", async() => {

        let rows = await server.query(`
            update company set
                name = 'test ' || id::text
            returning *
        `);

        assert.deepEqual(rows, [
            {
                id: 1,
                name: "test 1",
                inn: "123"
            },
            {
                id: 2,
                name: "test 2",
                inn: "456"
            }
        ]);
    });

    it("`update ... returning row *` returning object", async() => {

        let row = await server.query(`
            update company set
                name = 'test'
            where id = 1
            returning row *
        `);

        assert.deepEqual(row, {
            id: 1,
            name: "test",
            inn: "123"
        });
    });

    it("`update row ` returning object", async() => {

        let row = await server.query(`
            update row company set
                name = 'test'
            where id = 1
        `);

        assert.deepEqual(row, {
            id: 1,
            name: "test",
            inn: "123"
        });
    });

    it("`update ... returning value ` returning value", async() => {

        let id = await server.query(`
            update company set
                inn = 'test'
            where name = 'Red'
            returning value id
        `);

        assert.deepEqual(id, 1);
    });

    it("`update row ... returning ` error: insert row should be without returning clause", async() => {
        let err;

        try {
            await server.query(`
                update row company set
                    name = 'test'
                where id = 1
                returning *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "update row should be without returning clause");
    });

    it("`update ... returning value *` error: returning value can't use with star", async() => {
        let err;

        try {
            await server.query(`
                update company set
                    name = 'test'
                where id = 1
                returning value *
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value can't use with star");
    });

    it("`update ... returning value ` error: returning value should have one column", async() => {
        let err;

        try {
            await server.query(`
                update company set
                    name = 'test'
                where id = 1
                returning value
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning value should have one column");
    });

    it("`update ... returning row ` error: returning row should have one column", async() => {
        let err;

        try {
            await server.query(`
                update company set
                    name = 'test'
                where id = 1
                returning row
            `);
        } catch(_err) {
            err = _err;
        }
        
        checkSyntaxError(err, "returning row should have one column");
    });

    it("`update ... returning row *` error: update row should return only one row", async() => {
        let err;
        try {
            await server.query(`
                update company set
                    name = id::text
                returning row *
            `);
        } catch(_err) {
            err = _err;
        }

        checkSyntaxError( err, "update row should return only one row" );
    });

});
