(function(QUnit, GrapeQLCoach) {
    "use strict";
    
    function testClass(className, SyntaxClass) {
        QUnit.test(className, (assert) => {
            window.assert = assert;
            SyntaxClass.tests.forEach(test => {
                
                let str = test.str,
                    parseFuncName = "parse" + className;
                
                try {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();
                    
                    if ( test.result ) {
                        assert.pushResult({
                            result: !!window.weakDeepEqual(test.result, result),
                            actual: result,
                            expected: test.result,
                            message: test.str
                        });
                    }
                } catch(err) {
                    if ( test.error ) {
                        assert.ok(true, str);
                    } else {
                        console.log(err);
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
    
})(window.QUnit, window.GrapeQLCoach);
