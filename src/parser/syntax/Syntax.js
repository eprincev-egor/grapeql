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
    
    removeChild(child) {
        if ( child.parent == this ) {
            child.parent = null;
        }
        
        let index = this.children.indexOf(child);
        if ( index != -1 ) {
            this.children.splice(index, 1);
        }
    }
    
    findChild(callback, context) {
        if ( !this.children ) {
            return;
        }
        
        for (let i = 0, n = this.children.length; i < n; i++) {
            let child = this.children[i],
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
        
        let result = callback.call(context || this, this.parent);
        if ( result === true ) {
            return this.parent;
        }
        return this.parent.findParent(callback, context);
    }
    
    findParentInstance(SyntaxClass) {
        return this.findParent(parent => parent instanceof SyntaxClass);
    }
    
    toString() {
        return this.coach.str.slice(this.startIndex, this.endIndex);
    }
}

Syntax.Word = class Word {
    constructor(word) {
        this.word = word;
    }
    
    clone() {
        return new Syntax.Word( this.word );
    }
    
    toString() {
        return this.word;
    }
};

module.exports = Syntax;
