
"use strict";

var SKIP_KEYS = [
    "Coach",
    "coach",
    "parent",
    "startIndex",
    "endIndex",
    "children",
    "_source"
];

var _typeof = function (obj) {
    return typeof obj;
};

function objectType(obj) {
    if (typeof obj === "undefined") {
        return "undefined";
    }

    // Consider: typeof null === object
    if (obj === null) {
        return "null";
    }

    var match = toString.call(obj).match(/^\[object\s(.*)\]$/),
        type = match && match[1];

    switch (type) {
    case "Number":
        if (isNaN(obj)) {
            return "nan";
        }
        return "number";
    case "String":
    case "Boolean":
    case "Array":
    case "Set":
    case "Map":
    case "Date":
    case "RegExp":
    case "Function":
    case "Symbol":
        return type.toLowerCase();
    default:
        return typeof obj === "undefined" ? "undefined" : _typeof(obj);
    }
}

// Test for equality any JavaScript type.
// Authors: Philippe Rathé <prathe@gmail.com>, David Chan <david@troi.org>
var equiv = (function () {

    // Value pairs queued for comparison. Used for breadth-first processing order, recursion
    // detection and avoiding repeated comparison (see below for details).
    // Elements are { a: val, b: val }.
    var pairs = [];

    function useStrictEquality(a, b) {

        // This only gets called if a and b are not strict equal, and is used to compare on
        // the primitive values inside object wrappers. For example:
        // `var i = 1;`
        // `var j = new Number(1);`
        // Neither a nor b can be null, as a !== b and they have the same type.
        if ((typeof a === "undefined" ? "undefined" : _typeof(a)) === "object") {
            a = a.valueOf();
        }
        if ((typeof b === "undefined" ? "undefined" : _typeof(b)) === "object") {
            b = b.valueOf();
        }

        return a === b;
    }

    function getRegExpFlags(regexp) {
        return "flags" in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
    }

    function isContainer(val) {
        return ["object", "array", "map", "set"].indexOf(objectType(val)) !== -1;
    }

    function breadthFirstCompareChild(a, b) {

        // If a is a container not reference-equal to b, postpone the comparison to the
        // end of the pairs queue -- unless (a, b) has been seen before, in which case skip
        // over the pair.
        if (a === b) {
            return true;
        }
        if (!isContainer(a)) {
            return typeEquiv(a, b);
        }
        if (pairs.every(function (pair) {
            return pair.a !== a || pair.b !== b;
        })) {

            // Not yet started comparing this pair
            pairs.push({ a: a, b: b });
        }
        return true;
    }

    var callbacks = {
        "string": useStrictEquality,
        "boolean": useStrictEquality,
        "number": useStrictEquality,
        "null": useStrictEquality,
        "undefined": useStrictEquality,
        "symbol": useStrictEquality,
        "date": useStrictEquality,

        "nan": function nan() {
            return true;
        },

        "regexp": function regexp(a, b) {
            return a.source === b.source &&

// Include flags in the comparison
getRegExpFlags(a) === getRegExpFlags(b);
        },

        // abort (identical references / instance methods were skipped earlier)
        "function": function _function() {
            return false;
        },

        "array": function array(a, b) {
            var i, len;

            len = a.length;
            if (len !== b.length) {

                // Safe and faster
                return false;
            }

            for (i = 0; i < len; i++) {

                // Compare non-containers; queue non-reference-equal containers
                if (!breadthFirstCompareChild(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        },

        // Define sets a and b to be equivalent if for each element aVal in a, there
        // is some element bVal in b such that aVal and bVal are equivalent. Element
        // repetitions are not counted, so these are equivalent:
        // a = new Set( [ {}, [], [] ] );
        // b = new Set( [ {}, {}, [] ] );
        "set": function set$$1(a, b) {
            var innerEq,
                outerEq = true;

            if (a.size !== b.size) {

                // This optimization has certain quirks because of the lack of
                // repetition counting. For instance, adding the same
                // (reference-identical) element to two equivalent sets can
                // make them non-equivalent.
                return false;
            }

            a.forEach(function (aVal) {

                // Short-circuit if the result is already known. (Using for...of
                // with a break clause would be cleaner here, but it would cause
                // a syntax error on older Javascript implementations even if
                // Set is unused)
                if (!outerEq) {
                    return;
                }

                innerEq = false;

                b.forEach(function (bVal) {
                    var parentPairs;

                    // Likewise, short-circuit if the result is already known
                    if (innerEq) {
                        return;
                    }

                    // Swap out the global pairs list, as the nested call to
                    // innerEquiv will clobber its contents
                    parentPairs = pairs;
                    if (innerEquiv(bVal, aVal)) {
                        innerEq = true;
                    }

                    // Replace the global pairs list
                    pairs = parentPairs;
                });

                if (!innerEq) {
                    outerEq = false;
                }
            });

            return outerEq;
        },

        // Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)
        // in a, there is some key-value pair (bKey, bVal) in b such that
        // [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not
        // counted, so these are equivalent:
        // a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );
        // b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );
        "map": function map(a, b) {
            var innerEq,
                outerEq = true;

            if (a.size !== b.size) {

                // This optimization has certain quirks because of the lack of
                // repetition counting. For instance, adding the same
                // (reference-identical) key-value pair to two equivalent maps
                // can make them non-equivalent.
                return false;
            }

            a.forEach(function (aVal, aKey) {

                // Short-circuit if the result is already known. (Using for...of
                // with a break clause would be cleaner here, but it would cause
                // a syntax error on older Javascript implementations even if
                // Map is unused)
                if (!outerEq) {
                    return;
                }

                innerEq = false;

                b.forEach(function (bVal, bKey) {
                    var parentPairs;

                    // Likewise, short-circuit if the result is already known
                    if (innerEq) {
                        return;
                    }

                    // Swap out the global pairs list, as the nested call to
                    // innerEquiv will clobber its contents
                    parentPairs = pairs;
                    if (innerEquiv([bVal, bKey], [aVal, aKey])) {
                        innerEq = true;
                    }

                    // Replace the global pairs list
                    pairs = parentPairs;
                });

                if (!innerEq) {
                    outerEq = false;
                }
            });

            return outerEq;
        },

        "object": function object(a, b) {
            var i,
                aProperties = [];

                // if (compareConstructors(a, b) === false) {
                //     return false;
                // }

                // Be strict: don't ensure hasOwnProperty and go deep
            for (i in a) {
                if ( SKIP_KEYS.includes(i) ) {
                    continue;
                }

                // Collect a's properties
                aProperties.push(i);

                // Skip OOP methods that look the same
                if (a.constructor !== Object && typeof a.constructor !== "undefined" && typeof a[i] === "function" && typeof b[i] === "function" && a[i].toString() === b[i].toString()) {
                    continue;
                }

                // Compare non-containers; queue non-reference-equal containers
                if (!breadthFirstCompareChild(a[i], b[i])) {
                    return false;
                }
            }

            // Ensures identical properties name
            return typeEquiv(aProperties.sort(), aProperties.sort());
        }
    };

    function typeEquiv(a, b) {
        var type = objectType(a);

        // Callbacks for containers will append to the pairs queue to achieve breadth-first
        // search order. The pairs queue is also used to avoid reprocessing any pair of
        // containers that are reference-equal to a previously visited pair (a special case
        // this being recursion detection).
        //
        // Because of this approach, once typeEquiv returns a false value, it should not be
        // called again without clearing the pair queue else it may wrongly report a visited
        // pair as being equivalent.
        return objectType(b) === type && callbacks[type](a, b);
    }

    function innerEquiv(a, b) {
        var i, pair;

        // We're done when there's nothing more to compare
        if (arguments.length < 2) {
            return true;
        }

        // Clear the global pair queue and add the top-level values being compared
        pairs = [{ a: a, b: b }];

        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            // Perform type-specific comparison on any pairs that are not strictly
            // equal. For container types, that comparison will postpone comparison
            // of any sub-container pair to the end of the pair queue. This gives
            // breadth-first search order. It also avoids the reprocessing of
            // reference-equal siblings, cousins etc, which can have a significant speed
            // impact when comparing a container of small objects each of which has a
            // reference to the same (singleton) large object.
            if (pair.a !== pair.b && !typeEquiv(pair.a, pair.b)) {
                return false;
            }
        }

        // ...across all consecutive argument pairs
        return arguments.length === 2 || innerEquiv.apply(this, [].slice.call(arguments, 1));
    }

    return function () {
        var result = innerEquiv.apply(undefined, arguments);

        // Release any retained objects
        pairs.length = 0;
        return result;
    };
})();

module.exports = equiv;
