(function(QUnit, GrapeQLCoach) {
    "use strict";
    
    function equal(assert, test, result) {
        for (let key in test.result) {
            if ( test.result[ key ] !== result[ key ] ) {
                assert.ok(false, 
                    test.str + 
                    "\n expected: " + JSON.stringify(test.result) +
                    "\n result: " + JSON.stringify(result)
                );
                return;
            }
        }
        
        assert.ok(true, test.str);
    }
    
    function testClass(className, SyntaxClass) {
        QUnit.test(className, (assert) => {
            SyntaxClass.tests.forEach(test => {
                
                let str = test.str,
                    parseFuncName = "parse" + className;
                
                try {
                    let coach = new GrapeQLCoach(str);
                    let result = coach[ parseFuncName ]();
                    
                    if ( test.result ) {
                        equal(assert, test, result);
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
