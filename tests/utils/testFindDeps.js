"use strict";

const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const Deps = require("../../src/parser/deps/Deps");
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
    let out = {
        tables: [],
        files: []
    };
    
    deps.tables.forEach(table => {
        let outTable = {
            schema: table.schema,
            name: table.name,
            columns: table.columns.sort()
        };

        out.tables.push(
            outTable
        );
    });

    out.tables.sort((tableA, tableB) => {
        if ( tableA.schema == tableB.schema ) {
            return tableA.name > tableB.name ? 1 : -1;
        } else {
            return tableA.schema > tableB.schema ? 1 : -1;
        }
    });


    deps.files.forEach(fileItem => {
        let outFile = {
            file: fileItem.file,
            columns: fileItem.columns.sort()
        };

        out.files.push(
            outFile
        );
    });

    out.files.sort((fileA, fileB) => {
        return fileA.file > fileB.file ? 1 : -1;
    });

    return out;
}

module.exports = testFindDeps;