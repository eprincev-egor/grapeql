"use strict";

const GrapeQL = require("../src/server/GrapeQL");
const GrapeQLCoach = require("../src/parser/GrapeQLCoach");
const config = require("./config");
const testRequest = require("./utils/testRequest");
const weakDeepEqual = require("./utils/weakDeepEqual");

global.it = function(testName, callback) {
    callback();
};

function testRemoveUnnesaryJoins(fromSelect, toSelect) {
    if ( !toSelect ) {
        toSelect = fromSelect;
    }

    it(`
            ${ fromSelect }
            --------------------------->
            ${ toSelect }
    `, () => {

        let coach;

        coach = new GrapeQLCoach(fromSelect);
        coach.skipSpace();
        let parsedFromSelect = coach.parseSelect();

        coach = new GrapeQLCoach(toSelect);
        coach.skipSpace();
        let parsedToSelect = coach.parseSelect();

        parsedFromSelect.removeUnnesaryJoins({server});

        return weakDeepEqual(parsedFromSelect, parsedToSelect);
    });
}

function testGetDbColumn(test) {
    it(`
        find ${ test.link } in
        ${ test.node }
    `, () => {

        let coach;

        coach = new GrapeQLCoach(test.link.trim());
        let link = coach.parseObjectLink();

        coach = new GrapeQLCoach(test.node.trim());
        let select = coach.parseSelect();

        select.getColumnSource({
            server
        }, link);
    });
}

function testSyntax(className, test) {
    it(test.str, () => {
    
        let str = test.str,
            parseFuncName = "parse" + className;
    
        
        let coach = new GrapeQLCoach(str);
        let result = coach[ parseFuncName ]();
    
        let isEqual = !!weakDeepEqual(test.result, result);
        if ( !isEqual ) {
            console.log("break here");
        }
    
    
        // auto test clone and toString
        let clone = result.clone();
        let cloneString = clone.toString();
        let cloneCoach = new GrapeQLCoach( cloneString );
        let cloneResult = cloneCoach[ parseFuncName ]();
    
        isEqual = !!weakDeepEqual(test.result, cloneResult);
    });
}


let server;
(async function() {
    server = await GrapeQL.start(config);

    global.server = server;
    global.testSyntax = testSyntax;
    global.testRequest = testRequest;
    global.testGetDbColumn = testGetDbColumn;
    global.testRemoveUnnesaryJoins = testRemoveUnnesaryJoins;
    global.GrapeQL = GrapeQL;
    global.GrapeQLCoach = GrapeQLCoach;

})();


setInterval(() => {}, 100000);
