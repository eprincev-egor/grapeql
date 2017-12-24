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
    
})(window.QUnit, window.GrapeQLCoach);
