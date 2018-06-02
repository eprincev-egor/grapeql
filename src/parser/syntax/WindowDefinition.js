"use strict";

const Syntax = require("./Syntax");

/*
window_definition is

[ existing_window_name ]
[ PARTITION BY expression [, ...] ]
[ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
[ frame_clause ]

The frame_clause can be one of

{ RANGE | ROWS } frame_start
{ RANGE | ROWS } BETWEEN frame_start AND frame_end

where frame_start and frame_end can be one of

UNBOUNDED PRECEDING
value PRECEDING
CURRENT ROW
value FOLLOWING
UNBOUNDED FOLLOWING
*/

class WindowDefinition extends Syntax {
    parse(coach) {
        // [ existing_window_name ]
        if ( !coach.is(/(partition|order|range|rows)[^\w$]/i) ) {
            this.windowDefinition = coach.parseObjectName();
            this.addChild(this.windowDefinition);
            coach.skipSpace();
        }

        // [ PARTITION BY expression [, ...] ]
        if ( coach.isWord("partition") ) {
            coach.expectWord("partition");
            coach.skipSpace();

            coach.expectWord("by");
            coach.skipSpace();

            this.partitionBy = coach.parseComma("Expression");
            this.partitionBy.forEach(item => this.addChild(item));
            coach.skipSpace();
        }

        // [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
        if ( coach.isWord("order") ) {
            coach.expectWord("order");
            coach.skipSpace();

            coach.expectWord("by");
            coach.skipSpace();

            this.orderBy = coach.parseComma("OrderByElement");
            this.orderBy.forEach(item => this.addChild(item));
            coach.skipSpace();
        }

        // { RANGE | ROWS } frame_start
        // { RANGE | ROWS } BETWEEN frame_start AND frame_end
        if ( coach.isWord("range") ) {
            coach.expectWord("range");
            coach.skipSpace();

            this.range = this.parseFrames(coach);
        }
        else if ( coach.isWord("rows") ) {
            coach.expectWord("rows");
            coach.skipSpace();

            this.rows = this.parseFrames(coach);
        }
    }

    /*
    frame_start
    BETWEEN frame_start AND frame_end
    */
    parseFrames(coach) {
        let frames = {};

        if ( coach.isWord("between") ) {
            coach.expectWord("between");
            coach.skipSpace();

            frames.start = this.parseFrameNumb(coach);

            coach.skipSpace();
            coach.expectWord("and");
            coach.skipSpace();

            frames.end = this.parseFrameNumb(coach);
        }
        else {
            frames.start = this.parseFrameNumb(coach);
        }

        return frames;
    }

    /*
    UNBOUNDED PRECEDING
    UNBOUNDED FOLLOWING
    CURRENT ROW
    value PRECEDING
    value FOLLOWING
     */
    parseFrameNumb(coach) {
        let frameNumb = {};

        if ( coach.isWord("unbounded") ) {
            coach.expectWord("unbounded");
            coach.skipSpace();

            frameNumb.unbounded = true;

            let word = coach.readWord().toLowerCase();
            if ( word != "preceding" && word != "following" ) {
                coach.throwError("expected word preceding or following");
            }

            if ( word == "preceding" ) {
                frameNumb.preceding = true;
            } else {
                frameNumb.following = true;
            }
        }
        else if ( coach.isWord("current") ) {
            coach.expectWord("current");
            coach.skipSpace();

            coach.expectWord("row");
            frameNumb.currentRow = true;
        }
        else {
            frameNumb.value = coach.parsePgNumber();
            coach.skipSpace();

            let word = coach.readWord().toLowerCase();
            if ( word != "preceding" && word != "following" ) {
                coach.throwError("expected word preceding or following");
            }

            if ( word == "preceding" ) {
                frameNumb.preceding = true;
            } else {
                frameNumb.following = true;
            }
        }

        return frameNumb;
    }

    is(coach) {
        // quotes or word
        return coach.isObjectName();
    }

    clone() {
        let clone = new WindowDefinition();

        if ( this.windowDefinition ) {
            clone.windowDefinition = this.windowDefinition.clone();
            clone.addChild(clone.windowDefinition);
        }

        if ( this.partitionBy ) {
            clone.partitionBy = this.partitionBy.map(item => item.clone());
            clone.partitionBy.forEach(item => clone.addChild(item));
        }

        if ( this.orderBy ) {
            clone.orderBy = this.orderBy.map(item => item.clone());
            clone.orderBy.forEach(item => clone.addChild(item));
        }

        if ( this.range ) {
            clone.range = this._cloneFrames(this.range);
        }
        else if ( this.rows ) {
            clone.rows = this._cloneFrames(this.rows);
        }

        return clone;
    }

    _cloneFrames(frames) {
        if ( "end" in frames ) {
            return {
                start: this._cloneFrameNumb(frames.start),
                end: this._cloneFrameNumb(frames.end)
            };
        } else {
            return {
                start: this._cloneFrameNumb(frames.start)
            };
        }
    }

    _cloneFrameNumb(frameNumb) {
        let cloneFrameNumb = {};
        if ( frameNumb.unbounded ) {
            cloneFrameNumb.unbounded = true;

            if ( frameNumb.preceding ) {
                cloneFrameNumb.preceding = true;
            } else {
                cloneFrameNumb.following = true;
            }
        }
        else if ( frameNumb.currentRow ) {
            cloneFrameNumb.currentRow = true;
        }
        else {
            cloneFrameNumb.value = frameNumb.value.clone();

            if ( frameNumb.preceding ) {
                cloneFrameNumb.preceding = true;
            } else {
                cloneFrameNumb.following = true;
            }
        }

        return cloneFrameNumb;
    }

    toString() {
        let out = "";

        if ( this.windowDefinition ) {
            out += this.windowDefinition.toString();
        }

        if ( this.partitionBy ) {
            if ( out ) { out += " "; }

            out += "partition by ";
            out += this.partitionBy.map(item => item.toString()).join(", ");
        }

        if ( this.orderBy ) {
            if ( out ) { out += " "; }

            out += "order by ";
            out += this.orderBy.map(item => item.toString()).join(", ");
        }

        if ( this.range ) {
            if ( out ) { out += " "; }

            out += "range " + this._frames2string(this.range);
        }
        else if ( this.rows ) {
            if ( out ) { out += " "; }

            out += "rows " + this._frames2string(this.rows);
        }

        return out;
    }

    _frames2string(frames) {
        if ( "end" in frames ) {
            return (
                "between " +
                this._frameNumb2string(frames.start) +
                " and " +
                this._frameNumb2string(frames.end)
            );
        } else {
            return this._frameNumb2string(frames.start);
        }
    }

    _frameNumb2string(frameNumb) {
        if ( frameNumb.unbounded ) {
            return (
                "unbounded " +
                (frameNumb.preceding ?
                    "preceding" :
                    "following")
            );
        }
        else if ( frameNumb.currentRow ) {
            return "current row";
        }
        else {
            return (
                frameNumb.value.toString() + " " +
                (frameNumb.preceding ? "preceding" : "following")
            );
        }
    }
}

module.exports = WindowDefinition;
