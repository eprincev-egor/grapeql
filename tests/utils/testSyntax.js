"use strict";

const assert = require("assert");
const GrapeQLCoach = require("../../src/parser/GrapeQLCoach");
const weakDeepEqual = require("../utils/weakDeepEqual");

function testSyntax(className, test) {
    it(test.str, () => {

        let str = test.str,
            parseFuncName = "parse" + className;

            //index++;
            //console.log(index);

        if ( test.error ) {
            try {
                let coach = new GrapeQLCoach(str);
                coach[ parseFuncName ]();
                assert.ok(false, "expected error: " + str);
            } catch(err) {
                assert.ok(true, "expected error: " + str);
            }
        }

        else if ( test.result ) {
            let coach = new GrapeQLCoach(str);
            let result;
            if ( test.options ) {
                result = coach[ parseFuncName ](test.options);
            } else {
                result = coach[ parseFuncName ]();
            }

            let isEqual = !!weakDeepEqual(test.result, result);
            if ( !isEqual ) {
                console.log("break here");
            }

            assert.ok(isEqual);


            // auto test clone and toString
            let clone = result.clone();
            let cloneString = clone.toString();
            let cloneCoach = new GrapeQLCoach( cloneString );
            
            let cloneResult;
            if ( test.options ) {
                cloneResult = cloneCoach[ parseFuncName ](test.options);
            } else {
                cloneResult = cloneCoach[ parseFuncName ]();
            }

            isEqual = !!weakDeepEqual(test.result, cloneResult);
            assert.ok(isEqual);
        }
        else {
            throw new Error("invalid test");
        }

    });
}

module.exports = testSyntax;
