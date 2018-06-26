"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("./weakDeepEqual");
const assert = require("assert");

function testRequest(test) {
    let testName = test.result;
    if ( !testName && test.error ) {
        testName = JSON.stringify(test, null, 4);
    }

    it(testName, () => {
        let server = test.server();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;

        if ( test.error ) {
            let hasError = false;
            try {
                node.parsed.buildSelect({
                    server,
                    node,

                    columns: request.columns,
                    where: request.where,
                    orderBy: request.orderBy,
                    offset: request.offset,
                    limit: request.limit,
                    vars: request.vars
                });
            } catch(err) {
                hasError = true;
            }
            assert.ok(hasError, "expected error");
        } else {
            let query = node.parsed.buildSelect({
                server,
                node,

                columns: request.columns,
                where: request.where,
                orderBy: request.orderBy,
                offset: request.offset,
                limit: request.limit,
                vars: request.vars
            });

            let sql = query.toString();
            let result = GrapeQLCoach.parseSelect( sql );

            let testResult = GrapeQLCoach.parseSelect(test.result);

            let isEqual = !!weakDeepEqual(testResult, result);

            if ( !isEqual ) {
                console.log( sql );
            }

            assert.ok(isEqual);
        }
    });
}

function testRequestCount(test) {
    it(test.result, () => {
        let server = test.server();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;
        let query = node.parsed.buildCount({
            server,
            node,

            columns: request.columns,
            where: request.where,
            orderBy: request.orderBy,
            offset: request.offset,
            limit: request.limit,
            vars: request.vars
        });

        let sql = query.toString();
        let result = GrapeQLCoach.parseSelect( sql );

        let testResult = GrapeQLCoach.parseSelect(test.result);

        let isEqual = !!weakDeepEqual(testResult, result);

        if ( !isEqual ) {
            console.log( sql );
        }

        assert.ok(isEqual);
    });
}

function testRequestIndexOf(test) {
    it(test.result, () => {
        let server = test.server();

        if ( test.nodes ) {
            for (let name in test.nodes) {
                let node = test.nodes[ name ];
                node = server.addNode(name, node);
                node.file = "./" + name + ".sql";
            }
        }

        let node = test.node;

        if ( /^\w+$/.test(node) ) {
            node = server.nodes[ node ];
        } else {
            node = server.addNode("Temp", node);
        }

        let request = test.request;
        let query = node.parsed.buildIndexOf({
            server,
            node,

            where: request.where,
            row: request.row,
            vars: request.vars
        });

        let sql = query.toString();
        let result = GrapeQLCoach.parseSelect( sql );

        let testResult = GrapeQLCoach.parseSelect(test.result);

        let isEqual = !!weakDeepEqual(testResult, result);

        if ( !isEqual ) {
            console.log( sql );
        }

        assert.ok(isEqual);
    });
}

function testInsert(test) {
    it(test.result, () => {
        let server = test.server();

        let node = test.node;
        let name = "Tmp";
        node = server.addNode(name, node);
        node.file = "./" + name + ".sql";

        let request = test.request;
        let query = node.parsed.buildInsert({
            server,
            node,

            row: request.row
        });

        assert.equal(query, test.result);
    });
}

function testDelete(test) {
    it(test.result, () => {
        let server = test.server();

        let node = test.node;
        let name = "Tmp";
        node = server.addNode(name, node);
        node.file = "./" + name + ".sql";

        let request = test.request;
        let query = node.parsed.buildDelete({
            server,

            where: request.where,
            offset: request.offset,
            limit: request.limit
        });

        assert.equal(query, test.result);
    });
}

function testUpdate(test) {
    it(test.result, () => {
        let server = test.server();

        let node = test.node;
        let name = "Tmp";
        node = server.addNode(name, node);
        node.file = "./" + name + ".sql";

        let request = test.request;
        let query = node.parsed.buildUpdate({
            server,

            set: request.set,
            where: request.where
        });

        assert.equal(query, test.result);
    });
}


module.exports = {
    testRequest,
    testRequestCount,
    testRequestIndexOf,
    testInsert,
    testDelete,
    testUpdate
};
