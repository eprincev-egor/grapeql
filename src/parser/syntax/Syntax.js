"use strict";

class Syntax {
    constructor(fromString) {
        this.parent = null;
        this.coach = null;
        this.startIndex = null;
        this.endIndex;

        if ( typeof fromString === "string" ) {
            fromString = fromString.trim();
            let coach = new this.Coach(fromString);
            this.parse(coach);
        }
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
    
    walk(iteration) {
        if ( !this.children ) {
            return;
        }
        
        for (let i = 0, n = this.children.length; i < n; i++) {
            let child = this.children[i];
            
            let wallker = new Wallker();
            iteration(child, wallker);
            
            if ( !wallker.isSkipped() ) {
                child.walk(iteration);
            }
        }
    }
    
    replaceLink(replace, to) {
        if ( typeof replace == "string" ) {
            replace = new this.Coach.ObjectLink(replace);
        }

        if ( typeof to == "string" ) {
            to = new this.Coach.ObjectLink(to);
        }

        this.walk((child, wallker) => {
            // don't replace table name
            // left join company on true
            if ( 
                child.parent instanceof this.Coach.FromItem &&
                child == child.parent.table
            ) {
                return;
            }
            
            // if subquery has fromitem with same link
            // then skip it subquery
            if ( child instanceof this.Coach.Select ) {
                if ( child.isDefinedFromLink(replace) ) {
                    wallker.skip();
                }
            }
            
            // finded ObjectLink, replace him
            else if ( child instanceof this.Coach.ObjectLink ) {
                child.replace(replace, to);
            }
        });
    }

    toString() {
        return this.coach.str.slice(this.startIndex, this.endIndex);
    }
}

class Wallker {
    skip() {
        this._skipped = true;
    }
    
    isSkipped() {
        return this._skipped;
    }
}

module.exports = Syntax;
