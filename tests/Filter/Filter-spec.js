"use strict";

let QUnit;
if ( typeof window == "undefined" ) {
    QUnit = require("qunit").QUnit;
} else {
    QUnit = window.QUnit;
}

const Filter = require("../../src/filter/Filter");

QUnit.test( "instance and methods", function( assert ) {
    var filter = new Filter();

    assert.ok( filter instanceof Filter, "right instance of Filter" );
});
    
function todayStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayEnd() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function tomorrowStart() {
    let date = new Date();
    return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 );
}
// 
// function tomorrowEnd() {
//     let date = new Date();
//     return +new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 23, 59, 59, 999);
// }
// 
function checkPosible(assert, arr) {
    var filter;

    var testName = JSON.stringify( arr );
    try {
        filter = new Filter(arr);
        assert.ok( filter instanceof Filter, testName );
    } catch(err) {
        assert.ok( false, "Filter: " + testName + "<br/> " + err );
    }
    return filter;
}

function checkImposible(assert, arr) {
    var filter;

    var testName = JSON.stringify( arr );
    try {
        filter = new Filter(arr);
        assert.ok( false, testName + "<br/> must be imposible" );
    } catch(err) {
        assert.ok( true, "imposible: " + testName + "<br/> " + err );
    }
    return filter;
}

function checkModel(assert, arr, data) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> model: " + JSON.stringify(data) + "<br/>check() === true";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( filter.check( data ), testName );
    } catch(err) {
        assert.ok( false,  testName + "<br/>" + err);
    }
}

function uncheckModel(assert, arr, data) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> model: " + JSON.stringify(data) + "<br/>check() === false";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( !filter.check( data ), testName );
    } catch(err) {
        assert.ok( false,  testName);
    }
}

function checkEmpty(assert, arr) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> isEmpty() === true";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( filter.isEmpty(), testName );
    } catch(err) {
        assert.ok( false,  testName);
    }
}

function uncheckEmpty(assert, arr) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> isEmpty() === false";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( !filter.isEmpty(), testName );
    } catch(err) {
        assert.ok( false,  testName);
    }
}

function checkHasColumn(assert, arr, column) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> hasColumn('" + column + "') === true";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( filter.hasColumn(column), testName );
    } catch(err) {
        assert.ok( false,  testName);
    }
}

function uncheckHasColumn(assert, arr, column) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> hasColumn('" + column + "') === true";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.ok( !filter.hasColumn(column), testName );
    } catch(err) {
        assert.ok( false,  testName);
    }
}

function checkJSON(assert, from, to) {
    var filter;

    var fromString = JSON.stringify( from );
    var toString = JSON.stringify( to );
    var testName = "source: " + fromString + "<br/> must be " + toString;
    try {
        if ( from instanceof Filter ) {
            filter = from;
        } else {
            filter = new Filter(from);
        }
        filter = filter.toJSON();
        filter = JSON.stringify( filter );

        testName += "<br/>result: " + filter;
        assert.ok( filter === toString, testName );
    } catch(err) {
        assert.ok( false, testName + "<br/> error: " + err );
    }
}

QUnit.test( "posible filters", function( assert ) {
    checkPosible(assert, []);

    checkPosible(assert, ["ID", "=", 1]);
    checkPosible(assert, ["ID", "equal", 1]);
    checkPosible(assert, ["ID", "==", 1]);
    checkPosible(assert, ["ID", "!=", 1]);
    checkPosible(assert, ["ID", "<>", 1]);
        
    checkPosible(assert, ["ID", ">", 1]);
    checkPosible(assert, ["ID", "<", 1]);
    checkPosible(assert, ["ID", "<=", 1]);
    checkPosible(assert, ["ID", ">=", 1]);
        
    checkImposible(assert, ["ID", ">", "abc"]);
    checkImposible(assert, ["ID", ">", NaN]);
        
    checkImposible(assert, ["ID", ">=", "abc"]);
    checkImposible(assert, ["ID", ">=", NaN]);
        
    checkImposible(assert, ["ID", "<", "abc"]);
    checkImposible(assert, ["ID", "<", NaN]);
        
    checkImposible(assert, ["ID", "<=", "abc"]);
    checkImposible(assert, ["ID", "<=", NaN]);
        
    checkPosible(assert, ["ID", "contain", 1]);
    checkPosible(assert, ["ID", "in", [1,2]]);
    checkPosible(assert, ["ID", "is", "null"]);
    checkPosible(assert, ["ID", "is", "not null"]);

    checkPosible(assert, ["not", ["ID", "=", 1]]);

    checkPosible(assert, [["ID", "=", 1]]);
    checkPosible(assert, [["ID", "==", 1]]);
    checkPosible(assert, [["ID", "==", new Date()]]);

    checkPosible(assert, [["ID", "=", 1], "or", ["ID", "=", 2]]);
    checkPosible(assert, [["ID", "=", 1], "||", ["ID", "=", 2]]);

    checkPosible(assert, [["ID", "=", 1], "and", [ ["ID", "=", 2], "or", ["ID", "=", 3] ]]);
    checkPosible(assert, [["ID", "=", 1], "&&", [ ["ID", "=", 2], "||", ["ID", "=", 3] ]]);

    checkPosible(assert, [["ID", "=", 1], "or", ["ID", "=", 2], "or", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "&&", ["ID", "=", 2], "||", ["ID", "=", 3]]);

    checkPosible(assert, [["ID", "=", 1], "and", ["ID", "=", 2]]);
    checkPosible(assert, [["ID", "=", 1], "&&", ["ID", "=", 2]]);
    checkPosible(assert, [["ID", "=", 1], "and", ["ID", "=", 2], "and", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "&&", ["ID", "=", 2], "&&", ["ID", "=", 3]]);

    checkPosible(assert, [["ID", "=", 1], "and", ["ID", "=", 2], "or", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "and", ["ID", "=", 2], "||", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "&&", ["ID", "=", 2], "or", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "&&", ["ID", "=", 2], "||", ["ID", "=", 3]]);
    checkPosible(assert, [["ID", "=", 1], "or", ["ID", "=", 2], "and", ["ID", "=", 3]]);

    checkPosible(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]]);
    checkPosible(assert, ["SOME_DATE", "inRange", []]);
    checkImposible(assert, ["SOME_DATE", "inRange", [{start: NaN, end: 1}]]);
    checkImposible(assert, ["SOME_DATE", "inRange", [{start: 0, end: NaN}]]);
    checkImposible(assert, ["SOME_DATE", "inRange", false]);

    checkPosible(assert, ["noRows", "noRows", "noRows"]);

    checkPosible(assert, {
        user: {
            key: "CURRENT_USER_MUST_SEE",
            type: "equal",
            value: 1
        },
        readed: {
            key: "IS_READED",
            type: "equal",
            value: 0
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            key: "ID",
            type: "in",
            value: [1,2,3,4]
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            noRows: true
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            withNulls: false
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            onlyNulls: true
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            withNulls: false,
            search: "ooo"
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            withNulls: false,
            search: undefined
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, ""]
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            search: "xxx"
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            search: undefined
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            search: undefined
        }
    });

    checkPosible(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            search: undefined
        }
    });

    checkPosible(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: undefined,
            notValues: []
        }
    });

    checkPosible(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: undefined,
            notValues: [1]
        }
    });

    checkPosible(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: "x",
            notValues: []
        }
    });

    checkPosible(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: "x",
            notValues: [1]
        }
    });

    checkPosible(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: undefined,
            values: [1]
        }
    });

    checkPosible(assert, ["DATE", "is", "today"]);
    checkPosible(assert, ["DATE", "is", "tomorrow"]);

    checkImposible(assert, ["or"]);
    checkImposible(assert, ["||"]);
    checkImposible(assert, ["or", []]);
    checkImposible(assert, ["||", []]);
    checkImposible(assert, [[], "or"]);

    checkImposible(assert, ["and"]);
    checkImposible(assert, ["&&"]);
    checkImposible(assert, ["and", []]);
    checkImposible(assert, ["&&", []]);
    checkImposible(assert, [[], "and"]);
    checkImposible(assert, [[], "&&"]);

    checkImposible(assert, ["and", "and"]);
    checkImposible(assert, ["and", "&&"]);
    checkImposible(assert, ["&&", "and"]);
    checkImposible(assert, ["&&", "&&"]);
    checkImposible(assert, ["and", "or"]);
    checkImposible(assert, ["and", "||"]);
    checkImposible(assert, ["&&", "or"]);
    checkImposible(assert, ["&&", "||"]);
    checkImposible(assert, ["or", "and"]);
    checkImposible(assert, ["or", "or"]);
    checkImposible(assert, ["or", "or", []]);
    checkImposible(assert, ["or", "or", [], "or", []]);
});

QUnit.test("test .check attributes, filterData, row", function( assert ) {
    checkModel(assert, ["ID", "=", 1], {filterData: {ID: 1}});
    uncheckModel(assert, ["ID", "=", 1], {filterData: {ID: 2}});
    checkModel(assert, ["ID", "=", 1], {attributes: {ID: 1}});
    uncheckModel(assert, ["ID", "=", 1], {attributes: {ID: 2}});
    checkModel(assert, ["ID", "=", 1], {ID: 1});
    uncheckModel(assert, ["ID", "=", 1], {ID: 2});
});

QUnit.test("test .check", function( assert ) {

    checkModel(assert, ["ID", "=", 1], {ID: 1});
    checkModel(assert, ["ID", "==", 1], {ID: 1});
    checkModel(assert, ["ID", "equal", 1], {ID: 1});
    checkModel(assert, ["ID", "=", 0], {ID: 0});
    checkModel(assert, ["ID", "==", 0], {ID: 0});
    checkModel(assert, ["ID", "equal", 0], {ID: 0});
    checkModel(assert, ["ID", "=", 0], {ID: "0"});
    checkModel(assert, ["ID", "==", 0], {ID: "0"});
    checkModel(assert, ["ID", "equal", 0], {ID: "0"});
    uncheckModel(assert, ["ID", "=", 0], {ID: null});
    uncheckModel(assert, ["ID", "==", 0], {ID: null});
    uncheckModel(assert, ["ID", "equal", 0], {ID: null});
    uncheckModel(assert, ["ID", "=", 1], {ID: 2});
    uncheckModel(assert, ["ID", "==", 1], {ID: 2});
    uncheckModel(assert, ["ID", "equal", 1], {ID: 2});

    checkModel(assert, ["not", ["ID", "=", 1]], {ID: 2});
    checkModel(assert, ["not", ["ID", "==", 1]], {ID: 2});
    checkModel(assert, ["not", ["ID", "equal", 1]], {ID: 2});
    checkModel(assert, ["!", ["ID", "=", 1]], {ID: 2});
    checkModel(assert, ["!", ["ID", "==", 1]], {ID: 2});
    checkModel(assert, ["!", ["ID", "equal", 1]], {ID: 2});
    uncheckModel(assert, ["not", ["ID", "=", 1]], {ID: 1});
    uncheckModel(assert, ["!", ["ID", "=", 1]], {ID: 1});

    checkModel(assert, ["NAME", "contain", "ооо"], {NAME: " ООО "});
    uncheckModel(assert, ["NAME", "contain", "ооо"], {NAME: " ОАО "});

    checkModel(assert, ["NAME", "is", "null"], {NAME: null});
    checkModel(assert, ["NAME", "is", "null"], {NAME: undefined});
    uncheckModel(assert, ["NAME", "is", "null"], {NAME: NaN});
    uncheckModel(assert, ["NAME", "is", "null"], {NAME: " ООО "});

    checkModel(assert, ["NAME", "is", "not null"], {NAME: "1"});
    uncheckModel(assert, ["NAME", "is", "not null"], {NAME: null});
    uncheckModel(assert, ["NAME", "is", "not null"], {NAME: undefined});

    checkModel(assert, ["ID", ">", 10], {ID: 11});
    uncheckModel(assert, ["ID", ">", 10], {ID: 10});

    checkModel(assert, ["ID", ">=", 10], {ID: 10});
    checkModel(assert, ["ID", ">=", 10], {ID: 11});
    uncheckModel(assert, ["ID", ">=", 10], {ID: 9});


    checkModel(assert, ["ID", "<", 10], {ID: 7});
    uncheckModel(assert, ["ID", "<", 10], {ID: 10});

    checkModel(assert, ["ID", "<=", 10], {ID: 10});
    checkModel(assert, ["ID", "<=", 10], {ID: 9});
    uncheckModel(assert, ["ID", "<=", 10], {ID: 20});

    checkModel(assert, ["ID", "!=", 10], {ID: 7});
    checkModel(assert, ["ID", "!=", 10], {ID: {}});

    checkModel(assert, ["ID", "in", [1,2,3,4]], {ID: 2});
    checkModel(assert, ["ID", "in", [null]], {ID: null});
    uncheckModel(assert, ["ID", "in", [1,2,3,4]], {ID: 0});

    uncheckModel(assert, {
        hasId: {
            key: "ID",
            type: "equal",
            value: 7
        },
        noRows: {
            type: "composite",
            key: "ID",
            noRows: true
        }
    }, {ID: 7});

    checkModel(assert, {
        hasId: {
            key: "ID",
            type: "equal",
            value: 7
        }
    }, {ID: 7});

    uncheckModel(assert, ["noRows", "noRows", "noRows"], {
        ID: 1
    });

    uncheckModel(assert, [["ID", "=", 1], "or", ["noRows", "noRows", "noRows"]], {
        ID: 1
    });

    checkModel(assert, {
        hasId: {
            key: "ID",
            type: "composite",
            withNulls: false
        }
    }, {ID: 7});
    uncheckModel(assert, {
        hasId: {
            key: "ID",
            type: "composite",
            withNulls: false
        }
    }, {ID: null});

    checkModel(assert, {
        hasId: {
            key: "ID",
            type: "composite",
            onlyNulls: true
        }
    }, {ID: null});
    uncheckModel(assert, {
        hasId: {
            key: "ID",
            type: "composite",
            onlyNulls: true
        }
    }, {ID: 7});

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            withNulls: false,
            search: "123"
        }
    }, {
        NAME: "0123456"
    });
    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            withNulls: false,
            search: "123"
        }
    }, {
        NAME: "012"
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            withNulls: false,
            search: undefined
        }
    }, {
        ID: "xxx"
    });

    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            withNulls: false,
            search: undefined
        }
    }, {
        ID: null
    });


    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, ""]
        }
    }, {
        ID: 1
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, ""]
        }
    }, {
        ID: ""
    });

    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, ""]
        }
    }, {
        ID: null
    });
    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, ""]
        }
    }, {
        ID: 2
    });


    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: null
    });
    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: 1
    });
    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: 2
    });
    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: ""
    });

    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: 4
    });

    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "ID",
            values: [1, 2, ""],
            withNulls: true
        }
    }, {
        ID: " "
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            search: "123"
        }
    }, {
        NAME: "123"
    });

    uncheckModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            search: "123"
        }
    }, {
        NAME: "12"
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            search: undefined
        }
    }, {
        NAME: null
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            search: undefined
        }
    }, {
        NAME: "1"
    });

    checkModel(assert, {
        onlyGroups: {
            type: "composite",
            key: "NAME",
            search: undefined
        }
    }, {
        NAME: "2"
    });

    checkModel(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: undefined,
            notValues: [1]
        }
    }, {
        ID: 2
    });

    checkModel(assert, {
        notValues: {
            type: "composite",
            key: "ID",
            search: undefined,
            notValues: [2]
        }
    }, {
        ID: 1
    });

    checkModel(assert, {
        notValues: {
            type: "composite",
            key: "NAME",
            search: "xx",
            notValues: ["xx"]
        }
    }, {
        NAME: "xxx"
    });

    uncheckModel(assert, {
        notValues: {
            type: "composite",
            key: "NAME",
            search: "xx",
            notValues: ["xx"]
        }
    }, {
        NAME: "xx"
    });

    checkModel(assert, ["NAME", "contain", ""], {NAME: "x"});
    uncheckModel(assert, ["NAME", "contain", null], {NAME: "x"});
    uncheckModel(assert, ["NAME", "contain", undefined], {NAME: "x"});
    checkModel(assert, ["NAME", "contain", ""], {NAME: "y"});
    uncheckModel(assert, ["NAME", "contain", null], {NAME: "y"});
    uncheckModel(assert, ["NAME", "contain", undefined], {NAME: "y"});
    checkModel(assert, ["NAME", "contain", ""], {NAME: ""});
    uncheckModel(assert, ["NAME", "contain", null], {NAME: ""});
    uncheckModel(assert, ["NAME", "contain", undefined], {NAME: ""});
    checkModel(assert, ["NAME", "contain", ""], {NAME: null});
    uncheckModel(assert, ["NAME", "contain", null], {NAME: null});
    uncheckModel(assert, ["NAME", "contain", undefined], {NAME: null});

    checkModel(assert, ["NAME", "contain", " "], {NAME: " "});
    uncheckModel(assert, ["NAME", "contain", " "], {NAME: "x"});
    uncheckModel(assert, ["NAME", "contain", " "], {NAME: "y"});
    uncheckModel(assert, ["NAME", "contain", " "], {NAME: ""});
    uncheckModel(assert, ["NAME", "contain", " "], {NAME: null});
    uncheckModel(assert, ["NAME", "contain", " "], {NAME: undefined});

    checkModel(assert, ["NAME", "contain", "вася"], {NAME: "вася"});
    checkModel(assert, ["NAME", "contain", "вася"], {NAME: "Xвася"});
    checkModel(assert, ["NAME", "contain", "вася"], {NAME: "XвасяY"});
    checkModel(assert, ["NAME", "contain", "вася"], {NAME: "ВАСЯ"});
    uncheckModel(assert, ["NAME", "contain", "вася"], {NAME: null});
    uncheckModel(assert, ["NAME", "contain", "вася"], {NAME: 1});
    uncheckModel(assert, ["NAME", "contain", "вася"], {NAME: ""});

    // абстракция модели занимается преобразованием значений модели для фильтрации,
    // поэтому тестируем как-будто данные уже преобразованы для фильтров
    checkModel(assert, ["SOME_DATE", "contain", "31."], {SOME_DATE: "31.12.2016"});
    checkModel(assert, ["SOME_DATE", "contain", "31."], {SOME_DATE: "31.12.2016 10:19"});
    uncheckModel(assert, ["SOME_DATE", "contain", "31."], {SOME_DATE: "30.12.2016 10:19"});

    checkModel(assert, ["SOME_DATE", "contain", ".12."], {SOME_DATE: "31.12.2016"});
    checkModel(assert, ["SOME_DATE", "contain", ".12."], {SOME_DATE: "31.12.2016 10:19"});
    checkModel(assert, ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.12.2016"});
    uncheckModel(assert, ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.11.2016"});
    uncheckModel(assert, ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.11.2012"});

    checkModel(assert, ["SOME_DATE", "contain", ".2016"], {SOME_DATE: "30.12.2016"});
    uncheckModel(assert, ["SOME_DATE", "contain", ".2016"], {SOME_DATE: "30.12.2017"});

    checkModel(assert, ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2016"});
    checkModel(assert, ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2017"});
    uncheckModel(assert, ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2117"});
    uncheckModel(assert, ["SOME_DATE", "contain", ".20"], {SOME_DATE: "20.11.2117"});

    checkModel(assert, ["NAME", "in", ["123"]], {NAME: "123"});
    uncheckModel(assert, ["NAME", "in", ["123"]], {NAME: "1234"});
    uncheckModel(assert, ["NAME", "in", ["123"]], {NAME: null});

    checkModel(assert, ["NAME", "in", ["null"]], {NAME: "null"});
    checkModel(assert, ["NAME", "in", ["123", "null"]], {NAME: "null"});
    checkModel(assert, ["NAME", "in", ["123", "null"]], {NAME: "123"});
    uncheckModel(assert, ["NAME", "in", ["null"]], {NAME: null});
    uncheckModel(assert, ["NAME", "in", ["null", "123"]], {NAME: null});
    uncheckModel(assert, ["NAME", "in", ["null"]], {NAME: undefined});

    checkModel(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 0 });
    checkModel(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 1 });
    uncheckModel(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 2 });
    uncheckModel(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: null });
    uncheckModel(assert, ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: undefined });
    checkModel(assert, ["SOME_DATE", "inRange", [{start: -10, end: 10}]], { SOME_DATE: -9 });
    uncheckModel(assert, ["SOME_DATE", "inRange", [{start: -10, end: 10}]], { SOME_DATE: -11 });
    uncheckModel(assert, ["SOME_DATE", "inRange", []], { SOME_DATE: -11 });

    checkModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xxy"
    });

    checkModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xxz"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xx"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xy"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xz"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "yz"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xyz"
    });

    checkModel(assert, [
        ["NAME", "contain", "xx"],
        "and", [
            ["NAME", "contain", "y"],
            "or",
            ["NAME", "contain", "z"]
        ]
    ], {
        NAME: "xxyz"
    });


    checkModel(assert, [
        ["NAME", "contain", "xx"],
        "or",
        ["NAME", "contain", "y"],
        "and",
        ["NAME", "contain", "z"]
    ], {
        NAME: "xyz"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "or",
        ["NAME", "contain", "y"],
        "and",
        ["NAME", "contain", "z"]
    ], {
        NAME: "y"
    });

    uncheckModel(assert, [
        ["NAME", "contain", "xx"],
        "or",
        ["NAME", "contain", "y"],
        "and",
        ["NAME", "contain", "z"]
    ], {
        NAME: "z"
    });

    checkModel(assert, [
        ["NAME", "contain", "xx"],
        "or",
        ["NAME", "contain", "y"],
        "and",
        ["NAME", "contain", "z"]
    ], {
        NAME: "xx"
    });

    var testString = new String("XX"); // jshint ignore: line
    testString._lowerCase = "xx";

    checkModel(assert, [
        "NAME", "contain", "xx"
    ], {
        NAME: testString
    });

    checkModel(assert, [
        "NAME", "contain", "XX"
    ], {
        NAME: testString
    });

    uncheckModel(assert, [
        "NAME", "contain", "xxx"
    ], {
        NAME: testString
    });

    checkModel(assert, [
        "NAME", "=", "XX"
    ], {
        NAME: testString
    });

    checkModel(assert, [
        "NAME", "!=", "xx"
    ], {
        NAME: testString
    });

    uncheckModel(assert, [
        "NAME", "=", "xx"
    ], {
        NAME: testString
    });

    // magic
    var testString2 = new String("aa"); // jshint ignore: line
    testString2._lowerCase = "bb";

    checkModel(assert, [
        "NAME", "=", "aa"
    ], {
        NAME: testString2
    });

    uncheckModel(assert, [
        "NAME", "=", "bb"
    ], {
        NAME: testString2
    });

    checkModel(assert, [
        "NAME", "contain", "bb"
    ], {
        NAME: testString2
    });

    uncheckModel(assert, [
        "NAME", "contain", "aa"
    ], {
        NAME: testString2
    });


    checkModel(assert, ["DATE", "is", "today"], {
        DATE: Date.now()
    });

    checkModel(assert, ["DATE", "is", "today"], {
        DATE: todayStart() + 23 * 60 * 60 * 1000
    });

    uncheckModel(assert, ["DATE", "is", "today"], {
        DATE: todayEnd() + 1
    });

    uncheckModel(assert, ["DATE", "is", "tomorrow"], {
        DATE: Date.now()
    });

    checkModel(assert, ["DATE", "is", "tomorrow"], {
        DATE: todayEnd() + 1
    });

    checkModel(assert, ["DATE", "is", "tomorrow"], {
        DATE: tomorrowStart() + 23 * 60 * 60 * 1000
    });

    checkModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: 1
    }}, {
        SOME_FIELD: 1
    });
    uncheckModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: 1
    }}, {
        SOME_FIELD: 2
    });
    uncheckModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: 1
    }}, {
        SOME_FIELD: null
    });

    checkModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: 0
    }}, {
        SOME_FIELD: 0
    });
    checkModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: "0"
    }}, {
        SOME_FIELD: "0"
    });
    uncheckModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: 0
    }}, {
        SOME_FIELD: null
    });

    // старые фильтры в этой ситуации не добавляют условие для поиска
    checkModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: null
    }}, {
        SOME_FIELD: null
    });
    checkModel(assert, {some: {
        key: "SOME_FIELD",
        type: "equal",
        value: null
    }}, {
        SOME_FIELD: 1
    });
    // а новые автоматом ставят is null
    checkModel(assert, ["SOME_FIELD", "=", null], {
        SOME_FIELD: null
    });
    uncheckModel(assert, ["SOME_FIELD", "=", null], {
        SOME_FIELD: 1
    });
});

QUnit.test("test .isEmpty", function( assert ) {
    checkEmpty(assert, []);
    uncheckEmpty(assert, ["x", "=", 1]);

    checkEmpty(assert, [[]]);
    uncheckEmpty(assert, [["x", "=", 1]]);

    checkEmpty(assert, [[], "and", []]);
    checkEmpty(assert, [[], "&&", []]);
    uncheckEmpty(assert, [[], "and", ["x", "=", 1]]);
    uncheckEmpty(assert, [[], "&&", ["x", "=", 1]]);
    uncheckEmpty(assert, [["x", "=", 1], "and", []]);
    uncheckEmpty(assert, [["x", "=", 1], "&&", []]);
    uncheckEmpty(assert, [["x", "=", 1], "and", ["x", "=", 1]]);
    uncheckEmpty(assert, [["x", "=", 1], "&&", ["x", "=", 1]]);

    checkEmpty(assert, [[], "or", []]);
    checkEmpty(assert, [[], "||", []]);
    uncheckEmpty(assert, [[], "or", ["x", "=", 1]]);
    uncheckEmpty(assert, [[], "||", ["x", "=", 1]]);
    uncheckEmpty(assert, [["x", "=", 1], "or", []]);
    uncheckEmpty(assert, [["x", "=", 1], "||", []]);
    uncheckEmpty(assert, [["x", "=", 1], "or", ["x", "=", 1]]);
    uncheckEmpty(assert, [["x", "=", 1], "||", ["x", "=", 1]]);

    checkEmpty(assert, [[], "and", [[[ [], "or", [] ]]]]);
    checkEmpty(assert, [[], "&&", [[[ [], "||", [] ]]]]);
    uncheckEmpty(assert, [["x", "=", 1], "and", [[[ [], "or", [] ]]]]);
    uncheckEmpty(assert, [["x", "=", 1], "&&", [[[ [], "||", [] ]]]]);
    uncheckEmpty(assert, [[], "and", [[[ ["x", "=", 1], "or", [] ]]]]);
    uncheckEmpty(assert, [[], "&&", [[[ ["x", "=", 1], "||", [] ]]]]);
    uncheckEmpty(assert, [[], "and", [[[ [], "or", ["x", "=", 1] ]]]]);
    uncheckEmpty(assert, [[], "&&", [[[ [], "||", ["x", "=", 1] ]]]]);
    uncheckEmpty(assert, [[], "and", [[[ ["x", "=", 1], "or", ["x", "=", 1] ]]]]);
    uncheckEmpty(assert, [["x", "=", 1], "and", [[[ [], "or", ["x", "=", 1] ]]]]);
    uncheckEmpty(assert, [["x", "=", 1], "and", [[[ ["x", "=", 1], "or", ["x", "=", 1] ]]]]);

    checkEmpty(assert, ["not", []]);
    checkEmpty(assert, ["!", []]);
    uncheckEmpty(assert, ["not", ["x", "=", 1]]);
    uncheckEmpty(assert, ["!", ["x", "=", 1]]);

    checkEmpty(assert, [["not", []], "or", ["not", []]]);
    checkEmpty(assert, [["!", []], "or", ["not", []]]);
    checkEmpty(assert, [["!", []], "or", ["!", []]]);
    uncheckEmpty(assert, [["not", []], "or", ["not", ["x", "=", 1]]]);
    uncheckEmpty(assert, [["not", ["x", "=", 1]], "or", ["not", []]]);
    uncheckEmpty(assert, [["not", ["x", "=", 1]], "or", ["not", ["x", "=", 1]]]);

    checkEmpty(assert, [["not", []], "and", ["not", []]]);
    uncheckEmpty(assert, [["not", []], "and", ["not", ["x", "=", 1]]]);
    uncheckEmpty(assert, [["not", ["x", "=", 1]], "and", ["not", []]]);
    uncheckEmpty(assert, [["not", ["x", "=", 1]], "and", ["not", ["x", "=", 1]]]);
});

QUnit.test("test lower, trimmed operators", function(assert) {

    checkModel(assert, ["ID", " =", 1], {
        ID: 1
    });
    uncheckModel(assert, ["ID", " =", 1], {
        ID: 2
    });

    checkModel(assert, [["ID", "=", 1], "OR", ["ID", "=", 2]], {
        ID: 1
    });
    uncheckModel(assert, [["ID", "=", 1], "OR", ["ID", "=", 2]], {
        ID: 3
    });

    checkModel(assert, [["ID", "=", 1], "OR ", ["ID", "=", 2]], {
        ID: 1
    });
    uncheckModel(assert, [["ID", "=", 1], "OR ", ["ID", "=", 2]], {
        ID: 3
    });


    checkModel(assert, ["NAME", " coNtain ", "abc"], {
        NAME: "ABC"
    });
    uncheckModel(assert, ["NAME", " coNtain ", "abc"], {
        NAME: "ab"
    });

    checkModel(assert, ["NAME", " Is ", " Not  Null"], {
        NAME: "ABC"
    });
    uncheckModel(assert, ["NAME", " Is ", " Not  Null"], {
        NAME: null
    });

    checkModel(assert, ["NAME", "iS  ", "  nuLL  "], {
        NAME: null
    });
    uncheckModel(assert, ["NAME", "iS  ", "  nuLL  "], {
        NAME: 1
    });
});



QUnit.test("test .and, .or, .remove", function( assert ) {
    var filter, newFilter;

    // or 1 2
    filter = new Filter([
        "ID", "=", 1
    ]);
    checkModel(assert, filter, {
        ID: 1
    });
    uncheckModel(assert, filter, {
        ID: 2
    });

    newFilter = filter.or([
        "ID", "=", 2
    ]);
    checkModel(assert, filter, {
        ID: 1
    });
    uncheckModel(assert, filter, {
        ID: 2
    });

    checkModel(assert, newFilter, {
        ID: 1
    });
    checkModel(assert, newFilter, {
        ID: 2
    });

    uncheckModel(assert, newFilter, {
        ID: 3
    });

    // contain x and y
    filter = new Filter([
        "NAME", "contain", "x"
    ]);
    checkModel(assert, filter, {
        NAME: "uxu"
    });
    uncheckModel(assert, filter, {
        NAME: "uyu"
    });

    newFilter = filter.and([
        "NAME", "contain", "y"
    ]);
    checkModel(assert, filter, {
        NAME: "uxu"
    });
    uncheckModel(assert, filter, {
        NAME: "uyu"
    });

    checkModel(assert, newFilter, {
        NAME: "uxuyu"
    });

    uncheckModel(assert, newFilter, {
        NAME: "uxu"
    });

    uncheckModel(assert, newFilter, {
        NAME: "uyu"
    });

    // empty or id1
    filter = new Filter();
    filter = filter.or(["ID", "=", 1]);
    checkModel(assert, filter, {
        ID: 1
    });

    uncheckModel(assert, filter, {
        ID: 2
    });

    // empty or id1 or id2
    filter = new Filter();
    filter = filter.or(["ID", "=", 1]).or(["ID", "=", 2]);
    checkModel(assert, filter, {
        ID: 1
    });

    checkModel(assert, filter, {
        ID: 2
    });

    uncheckModel(assert, filter, {
        ID: 3
    });

    try {
        filter = new Filter();
        filter = filter.and({
            test: {
                key: "ID",
                type: "equal",
                value: 1
            }
        });

        assert.ok(filter.check({
            ID: 1
        }), "and {ID=1}");
    } catch(err) {
        assert.ok(false, ".and({ key: ID, type: 'equal', value: 1 })<br/> Error: " + err);
    }


    // remove 1 2
    (function() {
        filter = new Filter([
            "ID", "=", 1
        ]);
        var id2 = ["ID", "=", 2];
        newFilter = filter.or(id2);

        checkModel(assert, newFilter, {
            ID: 1
        });

        checkModel(assert, newFilter, {
            ID: 2
        });

        uncheckModel(assert, newFilter, {
            ID: 3
        });

        newFilter = newFilter.remove(id2);

        checkModel(assert, newFilter, {
            ID: 1
        });

        uncheckModel(assert, newFilter, {
            ID: 2
        });
    })();


    // remove 1 2 3
    (function() {
        var
            id1 = ["ID", "=", 1],
            id2 = ["ID", "=", 2],
            id3 = ["ID", "=", 3];

        filter = new Filter(id1);

        checkModel(assert, filter, {
            ID: 1
        });

        uncheckModel(assert, filter, {
            ID: 2
        });

        uncheckModel(assert, filter, {
            ID: 3
        });

        filter = filter.or(id2).or(id3);

        checkModel(assert, filter, {
            ID: 1
        });

        checkModel(assert, filter, {
            ID: 2
        });

        checkModel(assert, filter, {
            ID: 3
        });

        uncheckModel(assert, filter, {
            ID: 4
        });

        filter = filter.remove(id1);

        uncheckModel(assert, filter, {
            ID: 1
        });

        checkModel(assert, filter, {
            ID: 2
        });

        checkModel(assert, filter, {
            ID: 3
        });

        filter = filter.remove(id2);

        uncheckModel(assert, filter, {
            ID: 1
        });

        uncheckModel(assert, filter, {
            ID: 2
        });

        checkModel(assert, filter, {
            ID: 3
        });

        filter = filter.remove(id3);

        checkEmpty(assert, filter);

        checkModel(assert, filter, {
            ID: 1
        });

        checkModel(assert, filter, {
            ID: 2
        });

        checkModel(assert, filter, {
            ID: 3
        });

    })();
});

QUnit.test("test hasColumn", function( assert ) {

    checkHasColumn(assert, ["NAME", "=", 1], "NAME");
    uncheckHasColumn(assert, ["NAME", "=", 1], "=");
    uncheckHasColumn(assert, ["NAME", "=", 1], 1);

    checkHasColumn(assert, [["NAME", "=", 1]], "NAME");
    uncheckHasColumn(assert, [["NAME", "=", 1]], "=");
    uncheckHasColumn(assert, [["NAME", "=", 1]], 1);

    checkHasColumn(assert, [["NAME", "=", 1], "or", ["ID", "=", 1]], "NAME");
    checkHasColumn(assert, [["NAME", "=", 1], "or", ["ID", "=", 1]], "ID");
    uncheckHasColumn(assert, [["NAME", "=", 1], "or", ["ID", "=", 1]], "=");
    uncheckHasColumn(assert, [["NAME", "=", 1], "or", ["ID", "=", 1]], 1);
    uncheckHasColumn(assert, [["NAME", "=", 1], "or", ["ID", "=", 1]], "or");
});

QUnit.test("each", function(assert) {
    var filter;
    var mustBe, elementsCount;

    // ====================
    mustBe = 1;
    filter = new Filter([
        "x", "=", 1
    ]);

    elementsCount = 0;
    filter.each(function(element) {
        var column = element && element[0];
        if ( column == "x" ) {
            elementsCount++;
        }
    });

    assert.ok( mustBe == elementsCount, "each ['x', '=', 1]" );

    // ====================
    mustBe = 2;
    filter = new Filter([
        ["x", "=", 1],
        "or",
        ["y", "=", 2]
    ]);

    elementsCount = 0;
    filter.each(function(element) {
        var column = element && element[0];
        if ( column == "x" ) {
            elementsCount++;
        }
        if ( column == "y" ) {
            elementsCount++;
        }
    });

    assert.ok( mustBe == elementsCount, "each [['x', '=', 1], 'or', ['y', '=', 2]]" );

    // ====================
});

QUnit.test("toJSON", function(assert) {
    checkJSON(assert, ["ID_ORDER", "=", "3132"], ["ID_ORDER", "=", "3132"]);
    checkJSON(assert, [["x", "=", "1"], "or", ["x", "=", 2]], [["x", "=", "1"], "or", ["x", "=", 2]]);

    checkJSON(assert, [
        ["ID_ORDER", "=", "3132"],
        "or",
        []
    ], ["ID_ORDER", "=", "3132"]);

    checkJSON(assert, [
        ["ID_ORDER", "=", "3132"],
        "or",
        [],
        "and",
        []
    ], ["ID_ORDER", "=", "3132"]);

    checkJSON(assert, [
        ["x", "=", "1"],
        "or",
        [],
        "and",
        ["y", "=", "2"]
    ], [
        ["x", "=", "1"],
        "and",
        ["y", "=", "2"]
    ]);

    checkJSON(assert, [
        ["x", "=", "1"],
        "and",
        [],
        "or",
        ["y", "=", "2"]
    ], [
        ["x", "=", "1"],
        "or",
        ["y", "=", "2"]
    ]);

    checkJSON(assert, [
        ["x", "=", "1"]
    ], ["x", "=", "1"]);

    checkJSON(assert, [], []);
    checkJSON(assert, [[]], []);
    checkJSON(assert, [[], "or", []], []);

    checkJSON(assert, [
        [],
        "or",
        ["x", "=", "1"]
    ], ["x", "=", "1"]);

    checkJSON(assert, [
        [],
        "and",
        ["ID_ORDER", "=", "3132"]
    ], ["ID_ORDER", "=", "3132"]);

    checkJSON(assert, [
        ["x", "=", "y"],
        "or",
        []
    ], ["x", "=", "y"]);

    checkJSON(assert, [
        [],
        "and",
        ["x", "=", "y"],
        "or",
        []
    ], ["x", "=", "y"]);

    checkJSON(assert, [
        [],
        "and",
        [
            ["x", "=", "y"],
            "and",
            [],
            "or",
            ["a", "=", "b"]
        ],
        "or",
        []
    ], [["x", "=", "y"], "or", ["a", "=", "b"]]);
});

QUnit.test(".filterData in model", function(assert) {

    checkModel(assert, ["ID", "=", 1], {
        filterData: {
            ID: 1
        }
    });

    uncheckModel(assert, ["ID", "=", 1], {
        filterData: {
            ID: 2
        }
    });

});
    
function checkGetColumns(assert, arr, columns) {
    var filter;

    var testName = "filter: " + JSON.stringify( arr ) + "<br/> columns: " + JSON.stringify(columns) + "<br/> filter.getColumns()";
    try {
        if ( arr instanceof Filter ) {
            filter = arr;
        } else {
            filter = new Filter(arr);
        }
        assert.deepEqual( filter.getColumns(), columns, testName );
    } catch(err) {
        assert.ok( false,  testName + "<br/>" + err);
    }
}
    
QUnit.test("filter.getColumns()", function(assert) {

    checkGetColumns(assert, ["ID", "=", 1], ["ID"]);
    checkGetColumns(assert, [["ID", "=", 1], "or", ["ID", "=", 2]], ["ID"]);
    checkGetColumns(assert, [["ID", "=", 1], "or", ["nAme", "=", 2], ["nAme", "=", 2]], ["ID", "nAme"]);
    checkGetColumns(assert, [["ID", "=", 1], "or", ["nAme", "=", 2], ["Name", "=", 2]], ["ID", "nAme", "Name"]);

});
