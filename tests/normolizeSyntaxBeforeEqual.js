(function() {
    "use strict";

    function normolizeSyntaxBeforeEqual(syntax) {
        if ( !syntax || typeof syntax != "object" ) {
            return;
        }
        
        syntax.Coach = null;
        delete syntax.coach;
        delete syntax.parent;
        delete syntax.startIndex;
        delete syntax.endIndex;
        delete syntax.children;
        delete syntax._source; // PgString
        
        for (let key in syntax) {
            normolizeSyntaxBeforeEqual( syntax[key] );
        }
    }

    window.normolizeSyntaxBeforeEqual = normolizeSyntaxBeforeEqual;
})();
