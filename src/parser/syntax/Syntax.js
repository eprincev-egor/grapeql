"use strict";

class Syntax {
    constructor() {
        this.parent = null;
        this.coach = null;
        this.startIndex = null;
        this.endIndex;
    }
    
    addChild(child) {
        if ( !this.children ) {
            this.children = [];
        }
        
        child.parent = this;
        this.children.push(child);
    }
    
    findChild(callback, context) {
        if ( !this.children ) {
            return;
        }
        
        for (var i = 0, n = this.children.length; i < n; i++) {
            var child = this.children[i],
                result = callback.call(context || this, child);
            
            if ( result === false ) {
                return false;
            }
            
            child.findChild(callback, context);
        }
    }
    
    findParent(callback, context) {
        if ( !this.parent ) {
            return;
        }
        
        var result = callback.call(context || this, this.parent);
        if ( result === false ) {
            return false;
        }
        this.parent.findParent(callback, context);
    }
    
    toString() {
        return this.coach.str.slice(this.startIndex, this.endIndex);
    }
}

module.exports = Syntax;
