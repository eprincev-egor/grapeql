"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const Deps = require("../../src/parser/Deps");
const assert = require("assert");

function testFindDeps(getServer, test) {
    it(`query:

        ${ test.query }

result:

${ JSON.stringify(test.result, null, 4) }
    `, () => {
        let server = getServer();

        let coach = new GrapeQLCoach(test.query.trim());
        let select = coach.parseSelect();
        
        let deps = new Deps({
            select,
            server
        });
        deps = transform( deps );
        

        assert.deepEqual(deps, test.result);
    });
}

function transform(deps) {
    let out = {};
    out.tables = [];
    
    deps.tables.forEach(table => {
        let outTable = {
            schema: table.schema,
            name: table.name,
            columns: table.columns == "*" ? "*" : table.columns.sort()
        };

        out.tables.push(
            outTable
        );
    });

    return out;
}

module.exports = testFindDeps;