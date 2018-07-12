"use strict";

module.exports = {

    removeUnnecessaryJoins({server}) {
        for (let i = 0, n = this.from.length; i < n; i++) {
            let fromItem = this.from[i];
            fromItem.removeUnnecessaryJoins({ server, select: this });
        }
    },

    isHelpfullJoin(join, options) {
        let fromLink = join.from.toTableLink();
        return this.isUsedFromLink(fromLink, options);
    },

    isUsedFromLink(fromLink, options) {
        options = options || {
            star: true,
            checkJoins: true,
            startChild: false
        };

        let isUsed = false;

        let child = options.startChild || this;

        child.walk((child, wallker) => {
            if ( child instanceof this.Coach.Column ) {
                // select *
                if ( child.parent == this && child.isStar() ) {
                    let columnLink = child.expression.getLink();
                    if ( columnLink.link.length == 1 ) {
                        isUsed = true;
                        wallker.stop();
                    }
                }
            }

            else if ( child instanceof this.Coach.ColumnLink ) {
                if ( child.containLink( fromLink ) ) {
                    isUsed = true;
                    wallker.stop();
                }
            }

            else if ( child instanceof this.Coach.Select ) {
                if ( child.isDefinedFromLink(fromLink) ) {
                    wallker.skip();
                }
            }

            else if ( child instanceof this.Coach.FromItem ) {
                if ( !child.lateral && child.parent instanceof this.Coach.Join ) {
                    wallker.skip();
                }

                else if ( options.checkJoins === false ) {
                    let select = child.findParentInstance(this.Coach.Select);
                    if ( select == this ) {
                        wallker.skip();
                    }
                }
            }
        });

        return isUsed;
    }
};
