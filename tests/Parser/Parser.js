(function(QUnit, GrapeQLCoach) {
    "use strict";
    
    let normolizeSyntaxBeforeEqual = window.normolizeSyntaxBeforeEqual;
    
    let index = 0; // for conditional break point
    function testClass(className, SyntaxClass) {
        QUnit.test(className, (assert) => {
            window.assert = assert;
            SyntaxClass.tests.forEach(test => {
                
                let str = test.str,
                    parseFuncName = "parse" + className;
                
                index++;
                try {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();
                    
                    if ( test.result ) {
                        normolizeSyntaxBeforeEqual(test.result);
                        normolizeSyntaxBeforeEqual(result);
                        
                        let isEqual = !!window.weakDeepEqual(test.result, result);
                        if ( !isEqual ) {
                            console.log("break here");
                        }
                        
                        assert.pushResult({
                            result: isEqual,
                            actual: result,
                            expected: test.result,
                            message: test.str
                        });
                    }
                } catch(err) {
                    if ( test.error ) {
                        assert.ok(true, str);
                    } else {
                        console.log(index, err);
                        assert.ok(false, str + "\n " + err);
                    }
                }
                
            });
        });
    }
    
    for (let key in GrapeQLCoach) {
        let SyntaxClass = GrapeQLCoach[ key ];
        
        if ( !SyntaxClass.tests ) {
            continue;
        }
        
        testClass(key, SyntaxClass);
    }
    
    
    
    function testReplaceComments(assert, strFrom, strTo) {
        let coach = new GrapeQLCoach(strFrom);
        coach.replaceComments();
        assert.equal(coach.str, strTo, strFrom);
    }
    
    QUnit.test("replaceComments", function(assert) {
        
        testReplaceComments(assert, "1-- \n1", "1   \n1");
        testReplaceComments(assert, "1-- \r1", "1   \r1");
        testReplaceComments(assert, "1--123\n\r1", "1     \n\r1");
        testReplaceComments(assert, "1+/*\n\r*/2", "1+  \n\r  2");
        testReplaceComments(assert, "1 + /* \n\r */2", "1 +    \n\r   2");
    });
    
})(window.QUnit, window.tests.GrapeQLCoach);
