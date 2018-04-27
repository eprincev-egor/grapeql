"use strict";

const assert = require("assert");
const Filter = require("../../src/filter/Filter");

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
function checkPosible(arr) {
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

function checkImposible(arr) {
    it("checkImposible " + arr, () => {
        var filter;

        var testName = JSON.stringify( arr );
        try {
            filter = new Filter(arr);
            assert.ok( false, testName + "<br/> must be imposible" );
        } catch(err) {
            assert.ok( true, "imposible: " + testName + "<br/> " + err );
        }
        return filter;
    });
}

function checkModel(arr, data) {
    it("checkModel " + arr, () => {
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
    });
}

function uncheckModel(arr, data) {
    it("uncheckModel " + arr, () => {

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
    });
}

function checkEmpty(arr) {
    it("checkEmpty " + arr, () => {
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
    });
}

function uncheckEmpty(arr) {
    it("uncheckEmpty " + arr, () => {
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
    });
}

function checkHasColumn(arr, column) {
    it("checkHasColumn " + arr, () => {
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
    });
}

function uncheckHasColumn(arr, column) {
    it("uncheckHasColumn " + arr, () => {
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
    });
}

function checkJSON(from, to) {
    it("checkJSON " + from, () => {
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
    });
}

function checkGetColumns(arr, columns) {
    it("checkGetColumns " + arr, () => {
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
    });
}

describe("Filter JS", () => {

    it( "instance and methods", () => {
        var filter = new Filter();

        assert.ok( filter instanceof Filter, "right instance of Filter" );
    });


    describe( "posible filters", () => {
        checkPosible( []);

        checkPosible( ["Company.ID", "=", 1]);

        checkPosible( ["ID", "=", 1]);
        checkPosible( ["ID", "equal", 1]);
        checkPosible( ["ID", "==", 1]);
        checkPosible( ["ID", "!=", 1]);
        checkPosible( ["ID", "<>", 1]);

        checkPosible( ["ID", ">", 1]);
        checkPosible( ["ID", "<", 1]);
        checkPosible( ["ID", "<=", 1]);
        checkPosible( ["ID", ">=", 1]);

        checkImposible( ["ID", ">", "abc"]);
        checkImposible( ["ID", ">", NaN]);

        checkImposible( ["ID", ">=", "abc"]);
        checkImposible( ["ID", ">=", NaN]);

        checkImposible( ["ID", "<", "abc"]);
        checkImposible( ["ID", "<", NaN]);

        checkImposible( ["ID", "<=", "abc"]);
        checkImposible( ["ID", "<=", NaN]);

        checkPosible( ["ID", "contain", 1]);
        checkPosible( ["ID", "in", [1,2]]);
        checkPosible( ["ID", "is", "null"]);
        checkPosible( ["ID", "is", "not null"]);

        checkPosible( ["not", ["ID", "=", 1]]);

        checkPosible( [["ID", "=", 1]]);
        checkPosible( [["ID", "==", 1]]);
        checkPosible( [["ID", "==", new Date()]]);

        checkPosible( [["ID", "=", 1], "or", ["ID", "=", 2]]);
        checkPosible( [["ID", "=", 1], "||", ["ID", "=", 2]]);

        checkPosible( [["ID", "=", 1], "and", [ ["ID", "=", 2], "or", ["ID", "=", 3] ]]);
        checkPosible( [["ID", "=", 1], "&&", [ ["ID", "=", 2], "||", ["ID", "=", 3] ]]);

        checkPosible( [["ID", "=", 1], "or", ["ID", "=", 2], "or", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "&&", ["ID", "=", 2], "||", ["ID", "=", 3]]);

        checkPosible( [["ID", "=", 1], "and", ["ID", "=", 2]]);
        checkPosible( [["ID", "=", 1], "&&", ["ID", "=", 2]]);
        checkPosible( [["ID", "=", 1], "and", ["ID", "=", 2], "and", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "&&", ["ID", "=", 2], "&&", ["ID", "=", 3]]);

        checkPosible( [["ID", "=", 1], "and", ["ID", "=", 2], "or", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "and", ["ID", "=", 2], "||", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "&&", ["ID", "=", 2], "or", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "&&", ["ID", "=", 2], "||", ["ID", "=", 3]]);
        checkPosible( [["ID", "=", 1], "or", ["ID", "=", 2], "and", ["ID", "=", 3]]);

        checkPosible( ["SOME_DATE", "inRange", [{start: 0, end: 1}]]);
        checkPosible( ["SOME_DATE", "inRange", []]);
        checkImposible( ["SOME_DATE", "inRange", [{start: NaN, end: 1}]]);
        checkImposible( ["SOME_DATE", "inRange", [{start: 0, end: NaN}]]);
        checkImposible( ["SOME_DATE", "inRange", false]);

        checkPosible( ["noRows", "noRows", "noRows"]);

        checkPosible( {
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

        checkPosible( {
            onlyGroups: {
                key: "ID",
                type: "in",
                value: [1,2,3,4]
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                noRows: true
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                withNulls: false
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                onlyNulls: true
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                withNulls: false,
                search: "ooo"
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                withNulls: false,
                search: undefined
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, ""]
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                search: "xxx"
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                search: undefined
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                search: undefined
            }
        });

        checkPosible( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                search: undefined
            }
        });

        checkPosible( {
            notValues: {
                type: "composite",
                key: "ID",
                search: undefined,
                notValues: []
            }
        });

        checkPosible( {
            notValues: {
                type: "composite",
                key: "ID",
                search: undefined,
                notValues: [1]
            }
        });

        checkPosible( {
            notValues: {
                type: "composite",
                key: "ID",
                search: "x",
                notValues: []
            }
        });

        checkPosible( {
            notValues: {
                type: "composite",
                key: "ID",
                search: "x",
                notValues: [1]
            }
        });

        checkPosible( {
            notValues: {
                type: "composite",
                key: "ID",
                search: undefined,
                values: [1]
            }
        });

        checkPosible( ["DATE", "is", "today"]);
        checkPosible( ["DATE", "is", "tomorrow"]);

        checkImposible( ["or"]);
        checkImposible( ["||"]);
        checkImposible( ["or", []]);
        checkImposible( ["||", []]);
        checkImposible( [[], "or"]);

        checkImposible( ["and"]);
        checkImposible( ["&&"]);
        checkImposible( ["and", []]);
        checkImposible( ["&&", []]);
        checkImposible( [[], "and"]);
        checkImposible( [[], "&&"]);

        checkImposible( ["and", "and"]);
        checkImposible( ["and", "&&"]);
        checkImposible( ["&&", "and"]);
        checkImposible( ["&&", "&&"]);
        checkImposible( ["and", "or"]);
        checkImposible( ["and", "||"]);
        checkImposible( ["&&", "or"]);
        checkImposible( ["&&", "||"]);
        checkImposible( ["or", "and"]);
        checkImposible( ["or", "or"]);
        checkImposible( ["or", "or", []]);
        checkImposible( ["or", "or", [], "or", []]);
    });

    describe("test .check attributes, filterData, row", () => {
        checkModel( ["ID", "=", 1], {filterData: {ID: 1}});
        uncheckModel( ["ID", "=", 1], {filterData: {ID: 2}});
        checkModel( ["ID", "=", 1], {attributes: {ID: 1}});
        uncheckModel( ["ID", "=", 1], {attributes: {ID: 2}});
        checkModel( ["ID", "=", 1], {ID: 1});
        uncheckModel( ["ID", "=", 1], {ID: 2});
    });

    describe("test .check", () => {

        checkModel( ["ID", "=", 1], {ID: 1});
        checkModel( ["ID", "==", 1], {ID: 1});
        checkModel( ["ID", "equal", 1], {ID: 1});
        checkModel( ["ID", "=", 0], {ID: 0});
        checkModel( ["ID", "==", 0], {ID: 0});
        checkModel( ["ID", "equal", 0], {ID: 0});
        checkModel( ["ID", "=", 0], {ID: "0"});
        checkModel( ["ID", "==", 0], {ID: "0"});
        checkModel( ["ID", "equal", 0], {ID: "0"});
        uncheckModel( ["ID", "=", 0], {ID: null});
        uncheckModel( ["ID", "==", 0], {ID: null});
        uncheckModel( ["ID", "equal", 0], {ID: null});
        uncheckModel( ["ID", "=", 1], {ID: 2});
        uncheckModel( ["ID", "==", 1], {ID: 2});
        uncheckModel( ["ID", "equal", 1], {ID: 2});

        checkModel( ["not", ["ID", "=", 1]], {ID: 2});
        checkModel( ["not", ["ID", "==", 1]], {ID: 2});
        checkModel( ["not", ["ID", "equal", 1]], {ID: 2});
        checkModel( ["!", ["ID", "=", 1]], {ID: 2});
        checkModel( ["!", ["ID", "==", 1]], {ID: 2});
        checkModel( ["!", ["ID", "equal", 1]], {ID: 2});
        uncheckModel( ["not", ["ID", "=", 1]], {ID: 1});
        uncheckModel( ["!", ["ID", "=", 1]], {ID: 1});

        checkModel( ["NAME", "contain", "ооо"], {NAME: " ООО "});
        uncheckModel( ["NAME", "contain", "ооо"], {NAME: " ОАО "});

        checkModel( ["NAME", "is", "null"], {NAME: null});
        checkModel( ["NAME", "is", "null"], {NAME: undefined});
        uncheckModel( ["NAME", "is", "null"], {NAME: NaN});
        uncheckModel( ["NAME", "is", "null"], {NAME: " ООО "});

        checkModel( ["NAME", "is", "not null"], {NAME: "1"});
        uncheckModel( ["NAME", "is", "not null"], {NAME: null});
        uncheckModel( ["NAME", "is", "not null"], {NAME: undefined});

        checkModel( ["ID", ">", 10], {ID: 11});
        uncheckModel( ["ID", ">", 10], {ID: 10});

        checkModel( ["ID", ">=", 10], {ID: 10});
        checkModel( ["ID", ">=", 10], {ID: 11});
        uncheckModel( ["ID", ">=", 10], {ID: 9});


        checkModel( ["ID", "<", 10], {ID: 7});
        uncheckModel( ["ID", "<", 10], {ID: 10});

        checkModel( ["ID", "<=", 10], {ID: 10});
        checkModel( ["ID", "<=", 10], {ID: 9});
        uncheckModel( ["ID", "<=", 10], {ID: 20});

        checkModel( ["ID", "!=", 10], {ID: 7});
        checkModel( ["ID", "!=", 10], {ID: {}});

        checkModel( ["ID", "in", [1,2,3,4]], {ID: 2});
        checkModel( ["ID", "in", [null]], {ID: null});
        uncheckModel( ["ID", "in", [1,2,3,4]], {ID: 0});

        uncheckModel( {
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

        checkModel( {
            hasId: {
                key: "ID",
                type: "equal",
                value: 7
            }
        }, {ID: 7});

        uncheckModel( ["noRows", "noRows", "noRows"], {
            ID: 1
        });

        uncheckModel( [["ID", "=", 1], "or", ["noRows", "noRows", "noRows"]], {
            ID: 1
        });

        checkModel( {
            hasId: {
                key: "ID",
                type: "composite",
                withNulls: false
            }
        }, {ID: 7});
        uncheckModel( {
            hasId: {
                key: "ID",
                type: "composite",
                withNulls: false
            }
        }, {ID: null});

        checkModel( {
            hasId: {
                key: "ID",
                type: "composite",
                onlyNulls: true
            }
        }, {ID: null});
        uncheckModel( {
            hasId: {
                key: "ID",
                type: "composite",
                onlyNulls: true
            }
        }, {ID: 7});

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                withNulls: false,
                search: "123"
            }
        }, {
            NAME: "0123456"
        });
        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                withNulls: false,
                search: "123"
            }
        }, {
            NAME: "012"
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                withNulls: false,
                search: undefined
            }
        }, {
            ID: "xxx"
        });

        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                withNulls: false,
                search: undefined
            }
        }, {
            ID: null
        });


        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, ""]
            }
        }, {
            ID: 1
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, ""]
            }
        }, {
            ID: ""
        });

        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, ""]
            }
        }, {
            ID: null
        });
        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, ""]
            }
        }, {
            ID: 2
        });


        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: null
        });
        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: 1
        });
        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: 2
        });
        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: ""
        });

        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: 4
        });

        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "ID",
                values: [1, 2, ""],
                withNulls: true
            }
        }, {
            ID: " "
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                search: "123"
            }
        }, {
            NAME: "123"
        });

        uncheckModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                search: "123"
            }
        }, {
            NAME: "12"
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                search: undefined
            }
        }, {
            NAME: null
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                search: undefined
            }
        }, {
            NAME: "1"
        });

        checkModel( {
            onlyGroups: {
                type: "composite",
                key: "NAME",
                search: undefined
            }
        }, {
            NAME: "2"
        });

        checkModel( {
            notValues: {
                type: "composite",
                key: "ID",
                search: undefined,
                notValues: [1]
            }
        }, {
            ID: 2
        });

        checkModel( {
            notValues: {
                type: "composite",
                key: "ID",
                search: undefined,
                notValues: [2]
            }
        }, {
            ID: 1
        });

        checkModel( {
            notValues: {
                type: "composite",
                key: "NAME",
                search: "xx",
                notValues: ["xx"]
            }
        }, {
            NAME: "xxx"
        });

        uncheckModel( {
            notValues: {
                type: "composite",
                key: "NAME",
                search: "xx",
                notValues: ["xx"]
            }
        }, {
            NAME: "xx"
        });

        checkModel( ["NAME", "contain", ""], {NAME: "x"});
        uncheckModel( ["NAME", "contain", null], {NAME: "x"});
        uncheckModel( ["NAME", "contain", undefined], {NAME: "x"});
        checkModel( ["NAME", "contain", ""], {NAME: "y"});
        uncheckModel( ["NAME", "contain", null], {NAME: "y"});
        uncheckModel( ["NAME", "contain", undefined], {NAME: "y"});
        checkModel( ["NAME", "contain", ""], {NAME: ""});
        uncheckModel( ["NAME", "contain", null], {NAME: ""});
        uncheckModel( ["NAME", "contain", undefined], {NAME: ""});
        checkModel( ["NAME", "contain", ""], {NAME: null});
        uncheckModel( ["NAME", "contain", null], {NAME: null});
        uncheckModel( ["NAME", "contain", undefined], {NAME: null});

        checkModel( ["NAME", "contain", " "], {NAME: " "});
        uncheckModel( ["NAME", "contain", " "], {NAME: "x"});
        uncheckModel( ["NAME", "contain", " "], {NAME: "y"});
        uncheckModel( ["NAME", "contain", " "], {NAME: ""});
        uncheckModel( ["NAME", "contain", " "], {NAME: null});
        uncheckModel( ["NAME", "contain", " "], {NAME: undefined});

        checkModel( ["NAME", "contain", "вася"], {NAME: "вася"});
        checkModel( ["NAME", "contain", "вася"], {NAME: "Xвася"});
        checkModel( ["NAME", "contain", "вася"], {NAME: "XвасяY"});
        checkModel( ["NAME", "contain", "вася"], {NAME: "ВАСЯ"});
        uncheckModel( ["NAME", "contain", "вася"], {NAME: null});
        uncheckModel( ["NAME", "contain", "вася"], {NAME: 1});
        uncheckModel( ["NAME", "contain", "вася"], {NAME: ""});

        // абстракция модели занимается преобразованием значений модели для фильтрации,
        // поэтому тестируем как-будто данные уже преобразованы для фильтров
        checkModel( ["SOME_DATE", "contain", "31."], {SOME_DATE: "31.12.2016"});
        checkModel( ["SOME_DATE", "contain", "31."], {SOME_DATE: "31.12.2016 10:19"});
        uncheckModel( ["SOME_DATE", "contain", "31."], {SOME_DATE: "30.12.2016 10:19"});

        checkModel( ["SOME_DATE", "contain", ".12."], {SOME_DATE: "31.12.2016"});
        checkModel( ["SOME_DATE", "contain", ".12."], {SOME_DATE: "31.12.2016 10:19"});
        checkModel( ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.12.2016"});
        uncheckModel( ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.11.2016"});
        uncheckModel( ["SOME_DATE", "contain", ".12."], {SOME_DATE: "30.11.2012"});

        checkModel( ["SOME_DATE", "contain", ".2016"], {SOME_DATE: "30.12.2016"});
        uncheckModel( ["SOME_DATE", "contain", ".2016"], {SOME_DATE: "30.12.2017"});

        checkModel( ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2016"});
        checkModel( ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2017"});
        uncheckModel( ["SOME_DATE", "contain", ".20"], {SOME_DATE: "30.11.2117"});
        uncheckModel( ["SOME_DATE", "contain", ".20"], {SOME_DATE: "20.11.2117"});

        checkModel( ["NAME", "in", ["123"]], {NAME: "123"});
        uncheckModel( ["NAME", "in", ["123"]], {NAME: "1234"});
        uncheckModel( ["NAME", "in", ["123"]], {NAME: null});

        checkModel( ["NAME", "in", ["null"]], {NAME: "null"});
        checkModel( ["NAME", "in", ["123", "null"]], {NAME: "null"});
        checkModel( ["NAME", "in", ["123", "null"]], {NAME: "123"});
        uncheckModel( ["NAME", "in", ["null"]], {NAME: null});
        uncheckModel( ["NAME", "in", ["null", "123"]], {NAME: null});
        uncheckModel( ["NAME", "in", ["null"]], {NAME: undefined});

        checkModel( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 0 });
        checkModel( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 1 });
        uncheckModel( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: 2 });
        uncheckModel( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: null });
        uncheckModel( ["SOME_DATE", "inRange", [{start: 0, end: 1}]], { SOME_DATE: undefined });
        checkModel( ["SOME_DATE", "inRange", [{start: -10, end: 10}]], { SOME_DATE: -9 });
        uncheckModel( ["SOME_DATE", "inRange", [{start: -10, end: 10}]], { SOME_DATE: -11 });
        uncheckModel( ["SOME_DATE", "inRange", []], { SOME_DATE: -11 });

        checkModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xxy"
        });

        checkModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xxz"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xx"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xy"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xz"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "yz"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xyz"
        });

        checkModel( [
            ["NAME", "contain", "xx"],
            "and", [
                ["NAME", "contain", "y"],
                "or",
                ["NAME", "contain", "z"]
            ]
        ], {
            NAME: "xxyz"
        });


        checkModel( [
            ["NAME", "contain", "xx"],
            "or",
            ["NAME", "contain", "y"],
            "and",
            ["NAME", "contain", "z"]
        ], {
            NAME: "xyz"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "or",
            ["NAME", "contain", "y"],
            "and",
            ["NAME", "contain", "z"]
        ], {
            NAME: "y"
        });

        uncheckModel( [
            ["NAME", "contain", "xx"],
            "or",
            ["NAME", "contain", "y"],
            "and",
            ["NAME", "contain", "z"]
        ], {
            NAME: "z"
        });

        checkModel( [
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

        checkModel( [
            "NAME", "contain", "xx"
        ], {
            NAME: testString
        });

        checkModel( [
            "NAME", "contain", "XX"
        ], {
            NAME: testString
        });

        uncheckModel( [
            "NAME", "contain", "xxx"
        ], {
            NAME: testString
        });

        checkModel( [
            "NAME", "=", "XX"
        ], {
            NAME: testString
        });

        checkModel( [
            "NAME", "!=", "xx"
        ], {
            NAME: testString
        });

        uncheckModel( [
            "NAME", "=", "xx"
        ], {
            NAME: testString
        });

        // magic
        var testString2 = new String("aa"); // jshint ignore: line
        testString2._lowerCase = "bb";

        checkModel( [
            "NAME", "=", "aa"
        ], {
            NAME: testString2
        });

        uncheckModel( [
            "NAME", "=", "bb"
        ], {
            NAME: testString2
        });

        checkModel( [
            "NAME", "contain", "bb"
        ], {
            NAME: testString2
        });

        uncheckModel( [
            "NAME", "contain", "aa"
        ], {
            NAME: testString2
        });


        checkModel( ["DATE", "is", "today"], {
            DATE: Date.now()
        });

        checkModel( ["DATE", "is", "today"], {
            DATE: todayStart() + 23 * 60 * 60 * 1000
        });

        uncheckModel( ["DATE", "is", "today"], {
            DATE: todayEnd() + 1
        });

        uncheckModel( ["DATE", "is", "tomorrow"], {
            DATE: Date.now()
        });

        checkModel( ["DATE", "is", "tomorrow"], {
            DATE: todayEnd() + 1
        });

        checkModel( ["DATE", "is", "tomorrow"], {
            DATE: tomorrowStart() + 23 * 60 * 60 * 1000
        });

        checkModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: 1
        }}, {
            SOME_FIELD: 1
        });
        uncheckModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: 1
        }}, {
            SOME_FIELD: 2
        });
        uncheckModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: 1
        }}, {
            SOME_FIELD: null
        });

        checkModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: 0
        }}, {
            SOME_FIELD: 0
        });
        checkModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: "0"
        }}, {
            SOME_FIELD: "0"
        });
        uncheckModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: 0
        }}, {
            SOME_FIELD: null
        });

        // старые фильтры в этой ситуации не добавляют условие для поиска
        checkModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: null
        }}, {
            SOME_FIELD: null
        });
        checkModel( {some: {
            key: "SOME_FIELD",
            type: "equal",
            value: null
        }}, {
            SOME_FIELD: 1
        });
        // а новые автоматом ставят is null
        checkModel( ["SOME_FIELD", "=", null], {
            SOME_FIELD: null
        });
        uncheckModel( ["SOME_FIELD", "=", null], {
            SOME_FIELD: 1
        });
    });

    describe("test .isEmpty", () => {
        checkEmpty( []);
        uncheckEmpty( ["x", "=", 1]);

        checkEmpty( [[]]);
        uncheckEmpty( [["x", "=", 1]]);

        checkEmpty( [[], "and", []]);
        checkEmpty( [[], "&&", []]);
        uncheckEmpty( [[], "and", ["x", "=", 1]]);
        uncheckEmpty( [[], "&&", ["x", "=", 1]]);
        uncheckEmpty( [["x", "=", 1], "and", []]);
        uncheckEmpty( [["x", "=", 1], "&&", []]);
        uncheckEmpty( [["x", "=", 1], "and", ["x", "=", 1]]);
        uncheckEmpty( [["x", "=", 1], "&&", ["x", "=", 1]]);

        checkEmpty( [[], "or", []]);
        checkEmpty( [[], "||", []]);
        uncheckEmpty( [[], "or", ["x", "=", 1]]);
        uncheckEmpty( [[], "||", ["x", "=", 1]]);
        uncheckEmpty( [["x", "=", 1], "or", []]);
        uncheckEmpty( [["x", "=", 1], "||", []]);
        uncheckEmpty( [["x", "=", 1], "or", ["x", "=", 1]]);
        uncheckEmpty( [["x", "=", 1], "||", ["x", "=", 1]]);

        checkEmpty( [[], "and", [[[ [], "or", [] ]]]]);
        checkEmpty( [[], "&&", [[[ [], "||", [] ]]]]);
        uncheckEmpty( [["x", "=", 1], "and", [[[ [], "or", [] ]]]]);
        uncheckEmpty( [["x", "=", 1], "&&", [[[ [], "||", [] ]]]]);
        uncheckEmpty( [[], "and", [[[ ["x", "=", 1], "or", [] ]]]]);
        uncheckEmpty( [[], "&&", [[[ ["x", "=", 1], "||", [] ]]]]);
        uncheckEmpty( [[], "and", [[[ [], "or", ["x", "=", 1] ]]]]);
        uncheckEmpty( [[], "&&", [[[ [], "||", ["x", "=", 1] ]]]]);
        uncheckEmpty( [[], "and", [[[ ["x", "=", 1], "or", ["x", "=", 1] ]]]]);
        uncheckEmpty( [["x", "=", 1], "and", [[[ [], "or", ["x", "=", 1] ]]]]);
        uncheckEmpty( [["x", "=", 1], "and", [[[ ["x", "=", 1], "or", ["x", "=", 1] ]]]]);

        checkEmpty( ["not", []]);
        checkEmpty( ["!", []]);
        uncheckEmpty( ["not", ["x", "=", 1]]);
        uncheckEmpty( ["!", ["x", "=", 1]]);

        checkEmpty( [["not", []], "or", ["not", []]]);
        checkEmpty( [["!", []], "or", ["not", []]]);
        checkEmpty( [["!", []], "or", ["!", []]]);
        uncheckEmpty( [["not", []], "or", ["not", ["x", "=", 1]]]);
        uncheckEmpty( [["not", ["x", "=", 1]], "or", ["not", []]]);
        uncheckEmpty( [["not", ["x", "=", 1]], "or", ["not", ["x", "=", 1]]]);

        checkEmpty( [["not", []], "and", ["not", []]]);
        uncheckEmpty( [["not", []], "and", ["not", ["x", "=", 1]]]);
        uncheckEmpty( [["not", ["x", "=", 1]], "and", ["not", []]]);
        uncheckEmpty( [["not", ["x", "=", 1]], "and", ["not", ["x", "=", 1]]]);
    });

    describe("test lower, trimmed operators", () => {

        checkModel( ["ID", " =", 1], {
            ID: 1
        });
        uncheckModel( ["ID", " =", 1], {
            ID: 2
        });

        checkModel( [["ID", "=", 1], "OR", ["ID", "=", 2]], {
            ID: 1
        });
        uncheckModel( [["ID", "=", 1], "OR", ["ID", "=", 2]], {
            ID: 3
        });

        checkModel( [["ID", "=", 1], "OR ", ["ID", "=", 2]], {
            ID: 1
        });
        uncheckModel( [["ID", "=", 1], "OR ", ["ID", "=", 2]], {
            ID: 3
        });


        checkModel( ["NAME", " coNtain ", "abc"], {
            NAME: "ABC"
        });
        uncheckModel( ["NAME", " coNtain ", "abc"], {
            NAME: "ab"
        });

        checkModel( ["NAME", " Is ", " Not  Null"], {
            NAME: "ABC"
        });
        uncheckModel( ["NAME", " Is ", " Not  Null"], {
            NAME: null
        });

        checkModel( ["NAME", "iS  ", "  nuLL  "], {
            NAME: null
        });
        uncheckModel( ["NAME", "iS  ", "  nuLL  "], {
            NAME: 1
        });
    });



    describe("test .and, .or, .remove", () => {
        var filter, newFilter;

        // or 1 2
        filter = new Filter([
            "ID", "=", 1
        ]);
        checkModel( filter, {
            ID: 1
        });
        uncheckModel( filter, {
            ID: 2
        });

        newFilter = filter.or([
            "ID", "=", 2
        ]);
        checkModel( filter, {
            ID: 1
        });
        uncheckModel( filter, {
            ID: 2
        });

        checkModel( newFilter, {
            ID: 1
        });
        checkModel( newFilter, {
            ID: 2
        });

        uncheckModel( newFilter, {
            ID: 3
        });

        // contain x and y
        filter = new Filter([
            "NAME", "contain", "x"
        ]);
        checkModel( filter, {
            NAME: "uxu"
        });
        uncheckModel( filter, {
            NAME: "uyu"
        });

        newFilter = filter.and([
            "NAME", "contain", "y"
        ]);
        checkModel( filter, {
            NAME: "uxu"
        });
        uncheckModel( filter, {
            NAME: "uyu"
        });

        checkModel( newFilter, {
            NAME: "uxuyu"
        });

        uncheckModel( newFilter, {
            NAME: "uxu"
        });

        uncheckModel( newFilter, {
            NAME: "uyu"
        });

        // empty or id1
        filter = new Filter();
        filter = filter.or(["ID", "=", 1]);
        checkModel( filter, {
            ID: 1
        });

        uncheckModel( filter, {
            ID: 2
        });

        // empty or id1 or id2
        filter = new Filter();
        filter = filter.or(["ID", "=", 1]).or(["ID", "=", 2]);
        checkModel( filter, {
            ID: 1
        });

        checkModel( filter, {
            ID: 2
        });

        uncheckModel( filter, {
            ID: 3
        });

        it("check", () => {
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
        });

        // remove 1 2
        (function() {
            filter = new Filter([
                "ID", "=", 1
            ]);
            var id2 = ["ID", "=", 2];
            newFilter = filter.or(id2);

            checkModel( newFilter, {
                ID: 1
            });

            checkModel( newFilter, {
                ID: 2
            });

            uncheckModel( newFilter, {
                ID: 3
            });

            newFilter = newFilter.remove(id2);

            checkModel( newFilter, {
                ID: 1
            });

            uncheckModel( newFilter, {
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

            checkModel( filter, {
                ID: 1
            });

            uncheckModel( filter, {
                ID: 2
            });

            uncheckModel( filter, {
                ID: 3
            });

            filter = filter.or(id2).or(id3);

            checkModel( filter, {
                ID: 1
            });

            checkModel( filter, {
                ID: 2
            });

            checkModel( filter, {
                ID: 3
            });

            uncheckModel( filter, {
                ID: 4
            });

            filter = filter.remove(id1);

            uncheckModel( filter, {
                ID: 1
            });

            checkModel( filter, {
                ID: 2
            });

            checkModel( filter, {
                ID: 3
            });

            filter = filter.remove(id2);

            uncheckModel( filter, {
                ID: 1
            });

            uncheckModel( filter, {
                ID: 2
            });

            checkModel( filter, {
                ID: 3
            });

            filter = filter.remove(id3);

            checkEmpty( filter);

            checkModel( filter, {
                ID: 1
            });

            checkModel( filter, {
                ID: 2
            });

            checkModel( filter, {
                ID: 3
            });

        })();
    });

    describe("test hasColumn", () => {

        checkHasColumn(["NAME", "=", 1], "NAME");
        uncheckHasColumn(["NAME", "=", 1], "=");
        uncheckHasColumn(["NAME", "=", 1], 1);

        checkHasColumn([["NAME", "=", 1]], "NAME");
        uncheckHasColumn([["NAME", "=", 1]], "=");
        uncheckHasColumn([["NAME", "=", 1]], 1);

        checkHasColumn([["NAME", "=", 1], "or", ["ID", "=", 1]], "NAME");
        checkHasColumn( [["NAME", "=", 1], "or", ["ID", "=", 1]], "ID");
        uncheckHasColumn( [["NAME", "=", 1], "or", ["ID", "=", 1]], "=");
        uncheckHasColumn( [["NAME", "=", 1], "or", ["ID", "=", 1]], 1);
        uncheckHasColumn( [["NAME", "=", 1], "or", ["ID", "=", 1]], "or");
    });

    describe("each", () => {
        it("each", () => {
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

        });
    // ====================
    });

    describe("toJSON", () => {
        checkJSON( ["ID_ORDER", "=", "3132"], ["ID_ORDER", "=", "3132"]);
        checkJSON( [["x", "=", "1"], "or", ["x", "=", 2]], [["x", "=", "1"], "or", ["x", "=", 2]]);

        checkJSON( [
            ["ID_ORDER", "=", "3132"],
            "or",
            []
        ], ["ID_ORDER", "=", "3132"]);

        checkJSON( [
            ["ID_ORDER", "=", "3132"],
            "or",
            [],
            "and",
            []
        ], ["ID_ORDER", "=", "3132"]);

        checkJSON( [
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

        checkJSON( [
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

        checkJSON( [
            ["x", "=", "1"]
        ], ["x", "=", "1"]);

        checkJSON( [], []);
        checkJSON( [[]], []);
        checkJSON( [[], "or", []], []);

        checkJSON( [
            [],
            "or",
            ["x", "=", "1"]
        ], ["x", "=", "1"]);

        checkJSON( [
            [],
            "and",
            ["ID_ORDER", "=", "3132"]
        ], ["ID_ORDER", "=", "3132"]);

        checkJSON( [
            ["x", "=", "y"],
            "or",
            []
        ], ["x", "=", "y"]);

        checkJSON( [
            [],
            "and",
            ["x", "=", "y"],
            "or",
            []
        ], ["x", "=", "y"]);

        checkJSON( [
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

    describe(".filterData in model", () => {

        checkModel( ["ID", "=", 1], {
            filterData: {
                ID: 1
            }
        });

        uncheckModel( ["ID", "=", 1], {
            filterData: {
                ID: 2
            }
        });

    });

    describe("filter.getColumns()", () => {

        checkGetColumns(["ID", "=", 1], ["ID"]);
        checkGetColumns([["ID", "=", 1], "or", ["ID", "=", 2]], ["ID"]);
        checkGetColumns([["ID", "=", 1], "or", ["nAme", "=", 2], ["nAme", "=", 2]], ["ID", "nAme"]);
        checkGetColumns([["ID", "=", 1], "or", ["nAme", "=", 2], ["Name", "=", 2]], ["ID", "nAme", "Name"]);

    });
});
