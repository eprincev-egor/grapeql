"use strict";

/**
 * example as Array 1
 * ["ID", "=", 3]
 *
 * example as Object 1
 * {
 *   x: {
 *     key: "ID",
 *     type: "equal" ,
 *     value: 3
 *   }
 * }
 *
 * example as Array 2
 * [["NAME", "contain", "рога"], "and", ["NAME_SMALL", "contain", "копыта"]]
 *
 * example as Object 2
 * {
 *   x: {
 *     key: "NAME",
 *     type: "contain",
 *     value: "рога"
 *   },
 *   y: {
 *     key: "NAME_SMALL",
 *     type: "contain",
 *     value: "копыта"
 *   }
 * }
 *
 * example as Array 3
 * [["ID", "=", 3], "or", ["ID", "=", 4]]
 *
 * example as Object 3
 * {
 *   x: {
 *     key: "ID",
 *     type: "in",
 *     value: [3, 4]
 *   }
 * }
 *
 * example as Array 4
 * [["ID", "=", 3], "or", ["COST", "=", 4]]
 *
 * example as Object 4
 * not supported =(
 *
 * =========================
 * =========================
 * =========================
 *
 * FilterAsArray specification
 *
 * Number:
 *      any js number (excluded NaN) or
 *      any js string like are number ("1", "0", "1.2") or
 *      null or undefined
 *
 * String:
 *      any js string or
 *      any number, but number will converted to js string or
 *      null or undefined
 *
 * Date:
 *      Date object or timestamp as number (unix timestamp) or
 *      String as "dd.mm.yyyy" or
 *      String as "dd.mm.yyyy hh:mm" or
 *      null or undefined
 *
 *      will compiled to unix timestamp
 *
 * Literal:
 *    String or Number or Date
 *
 * IsValue:
 *    js string, can be one of:
 *    "not null"
 *    "null"
 *    "today"
 *    "tomorrow"
 *
 *    ignore case and spaces
 *
 * Column:
 *    js trimmed string, any column name of model, in uppercase
 *    (excluded of search empty string)
 *
 * Operator:
 *      js string, will trimmed and converted to lower case
 *      can be one of:
 *          "="             equal left and right
 *          "!="            inversion equal
 *          "<>"            inversion equal
 *          ">"
 *          "<"
 *          ">="
 *          "<="
 *          "contain"       (like %operand%)
 *          "is"            check on null or on not null or date in today, tomorrow
 *          "in"            check left operand in right operand array
 *          "inRange"
 *          "noRows"        imposible filter, every check return false
 *
 * AnyValue:
 *    can be one of:
 *      Number
 *      String
 *      IsValue
 *      Array
 *
 * ConditionElement:
 *      [Column or "noRows", Operator, AnyValue]
 *
 *      can be one of:
 *          [Column, "=", Literal]
 *          [Column, ">", Literal]
 *          [Column, ">=", Literal]
 *          [Column, "<", Literal]
 *          [Column, "<=", Literal]
 *          [Column, "!=", Literal]
 *          [Column, "<>", Literal]
 *          [Column, "contain", String]
 *          [Column, "is", "not null"]
 *          [Column, "is", "null"]
 *          [Column, "is", "today"]
 *          [Column, "is", "tomorrow"]
 *          [Column, "in", Array]
 *          ["noRows", "noRows", "noRows"]
 *
 * AndOperator:
 *   js string: "and"
 *   RegExp: \s*and\s*
 *   ignore case
 *
 *   usage:
 *   [ConditionElement, "and", ConditionElement]
 *
 * OrOperator
 *   js string: "or"
 *   RegExp: \s*or\s*
 *   ignore case
 *
 *   usage:
 *   [ConditionElement, "or", ConditionElement]
 *
 * NotOperator:
 *   js string: "not"
 *   RegExp: \s*not\s*
 *   ignore case
 *
 *    usage:
 *    ["not", ConditionElement]
 *
 * UnaryConditionOperator:
 *      can be one of:
 *          NotOperator
 *
 * BinaryConditionOperator:
 *      can be one of:
 *          AndOperator
 *          OrOperator
 *
 * UnaryCondition:
 *      [UnaryConditionOperator, Condition]
 *
 * Condition:
 *      can be one of:
 *          ConditionElement
 *          UnaryCondition
 *          [Condition, BinaryConditionOperator, Condition, ...]
 *
 * FilterAsArray:
 *      it's just Condition
 *
 * examples FilterAsArray:
 *  [["ID", "=", 3], "or", ["ID", "=", 4], "or", ["ID", "=", 5]]
 *  [["not", ["ID", "=", "3"]], "or", ["NAME", "contain", "ooo"]]
 */
// TODO:
// operators:
// ilike
// like
// startswith
// endswith


const _ = require("lodash");
const Condition = require("./Condition");

function parseDate(value) {
    if ( value instanceof Date ) {
        return value;
    }
    
    if ( _.isNumber(value) ) { // unix timestamp
        return new Date(value);
    }
    
    if ( _.isString(value) ) {
        let str = value;
        
        // day.month.year hours:minutes:seconds:ms
        // 26.06.2015 12:03:48:123
        // year.month.day hours:minutes:seconds:ms
        // 2015.06.26 12:03:48:123
        if ( /^(\d\d\.\d\d\.\d\d\d\d|\d\d\d\d\.\d\d\.\d\d)(\s+\d\d:\d\d(:\d\d)?)?/.test(str) ) {
            let day, month, year, hours, minutes, seconds,
                date;
            
            if ( /^\d\d\d\d/.test(value) ) {
                day = str.slice(8, 10);
                month = str.slice(5, 7) - 1;
                year = str.slice(0, 4);
            } else {
                day = str.slice(0, 2);
                month = str.slice(3, 5) - 1;
                year = str.slice(6, 10);
            }

            if ( str.length > 10 ) {
                hours = str.slice(11, 13);
                minutes = str.slice(14, 16);

                if ( str.length > 16 ) {
                    seconds = str.slice(17, 19);

                    date = new Date(year, month, day, hours, minutes, seconds);
                    //}
                } else {
                    date = new Date(year, month, day, hours, minutes);
                }
            } else {
                date = new Date(year, month, day);
            }
            
            return date;
        } else {
            return Date.parse(value);
        }
    }
    
    return NaN;
}

class Filter {
    constructor(elements) {
        this._source = elements;

        if ( !elements ) {
            elements = [];
        }

        this.noRows = false;

        if ( elements instanceof Filter ) {
            elements = elements.toJSON();
        }

        // filter 2.0 => filter 3.0
        if ( _.isObject(elements.conditions) && !_.isArray(elements.conditions) && elements.query ) {
            elements = elements.conditions;
        }

        if ( _.isObject(elements) && !_.isArray(elements) ) {
            elements = this.objectFilter2elements(elements);
        }

        this.condition = new Condition(elements);
        if ( this.condition.noRows ) {
            this.noRows = true;
        }
    }

    check(row) {
        if ( this.noRows ) {
            return false;
        }

        // super fix!!
        // .filterData is "private" logic in RowModel
        row = row.filterData || row.attributes || row;

        if ( !this._compiledJS ) {
            this._compiledJS = new Function("row", "with(row){return (\n" + this.condition.compile2js() + ")\n}"); // jshint ignore: line
        }

        return this._compiledJS(row);
    }

    toJSON() {
        if ( !this._compiledJSON ) {
            this._compiledJSON = this.condition.compile2json();
        }
        return _.cloneDeep( this._compiledJSON );
    }
    
    toSql(model) {
        return this.condition.compile2sql(model);
    }

    clone() {
        let clone = new Filter( this.toJSON() );
        clone._source = this._source;
        return clone;
    }

    isEmpty() {
        return this.condition.isEmpty();
    }

    objectFilter2elements(filter2) {
        let elements = [],
            element,
            condition, type,
            column;

        for (let conditionKey in filter2) {
            condition = filter2[ conditionKey ];
            column = condition.key;
            type = condition.type;

            if ( type == "equal" ) {
                if ( condition.value == null ) {
                    // старые фильтры в этой ситуации не добавляют условие для поиска
                    // а новые автоматом ставят is null
                    element = [[column, "is", "null"], "or", [column, "is", "not null"]];
                } else {
                    element = [column, "=", condition.value];
                }
            }

            else if ( type == "contain" ) {
                element = [column, "contain", condition.value];
            }

            else if ( type == "in" ) {
                element = [column, "in", condition.value];
            }

            else if ( type == "date" ) {
                if ( !_.isArray(condition.intervals) ) {
                    throw new Error("invalid filter 2.0");
                }

                element = this._intervals2element(column, condition.intervals);
            }

            // !!!!!   WARNING !!!!!
            // brainfuck
            else if ( type == "composite" ) {
                if ( condition.noRows ) {
                    // !!!!!   WARNING !!!!!
                    // иногда нужен фильтр, который всегда будет отсеивать все модели.
                    // Запрос таким фильтром ненадо отправлять на сервер, поэтому нужно его пометить
                    this.noRows = true;
                    return [];
                }

                // composite is pain!

                let searchElement,
                    valuesElement;

                if ( condition.search ) {
                    searchElement = [column, "contain", condition.search];
                }

                let values = condition.notValues || condition.values;
                if ( _.isArray(values) ) {
                    if ( _.isObject(values[0]) ) {
                        valuesElement = this._intervals2element(column, values);
                    } else {
                        valuesElement = [column, "in", values];
                    }

                    if ( condition.notValues ) {
                        valuesElement = ["not", valuesElement];
                    }
                }

                if ( searchElement && valuesElement ) {
                    element = [searchElement, "and", valuesElement];
                } 
                else if ( searchElement ) {
                    element = searchElement;
                } 
                else if ( valuesElement ) {
                    element = valuesElement;
                }

                if ( condition.onlyNulls ) {
                    element = [column, "is", "null"];
                } 
                else if ( condition.withNulls === true ) {
                    if ( element ) {
                        element = [element, "or", [column, "is", "null"]];
                    } else {
                        element = [column, "is", "null"];
                    }
                } 
                else if ( condition.withNulls === false )  {
                    if ( element ) {
                        element = [element, "and", [column, "is", "not null"]];
                    } else {
                        element = [column, "is", "not null"];
                    }
                }

                if ( !element ) {
                    // anyModel
                    element = [[column, "is", "not null"], "or", [column, "is", "null"]];
                }
            }

            else {
                throw new Error("invalid filter 2.0");
            }

            if ( condition.not ) {
                element = ["not", element];
            }

            if ( elements.length ) {
                elements.push("and");
            }
            elements.push( element );
        }

        return elements;
    }

    _intervals2element(column, intervals) {
        let element = [],
            i, n = intervals.length;

        for (i = 0; i < n; i++) {
            let interval = intervals[ i ];

            if ( !_.isObject(interval) ) {
                throw new Error("invalid filter 2.0");
            }

            let start = +parseDate(interval.start);
            let end = +parseDate(interval.end);

            if ( i ) {
                element.push("or");
            }

            element.push([
                [column, ">=", start],
                "or",
                [column, "<=", end]
            ]);
        }

        return element;
    }

    and(filter) {
        return this._combine(filter, "and");
    }

    or(filter) {
        return this._combine(filter, "or");
    }

    _combine(filter, binaryConditionOperator) {
        // filter может быть массивом или объектом или экземпляром filter,
        // в любом случае это ссылочный тип данных.
        // в дальнейшем (remove) мы будем его использовать в качестве идентификатора условия
        let source = filter;

        // конструктор filter3 ждет json структуру
        if ( !(filter instanceof Filter) ) {
            filter = new Filter(filter);
        }
        filter = filter.toJSON();

        let newFilter;
        if ( this.isEmpty() ) {
            newFilter = [filter]; // квадратные скобки нужны @see empty tests
        } else {
            newFilter = [
                // current filter
                this.toJSON(),
                // and/or
                binaryConditionOperator,
                // additional filter
                filter
            ];
        }

        // создаем новый фильтр, т.к. хотим ЯВное изменение фильтра курсора
        // назовем это "иммутабельность"
        newFilter = new Filter(newFilter);
        newFilter._source = source;

        // для удаления нужно знать полный путь "комбинирования" фильтров
        newFilter._parent = this;
        newFilter._combineOperator = binaryConditionOperator;

        return newFilter;
    }

    remove(source) {
        if ( !this._parent ) {
            // case1:
            // new Filter3(source1).remove(source1)
            // =>
            // new Filter3()
            //
            // case2:
            // new Filter3(source1).or(source2).remove(source1)
            // =>
            // new Filter3(source2)
            if ( this._source === source ) {
                return new Filter();
            }

            return this.clone();
        }

        let parent = this._parent.remove( source );

        if ( this._source !== source ) {
            parent = parent._combine(
                this._source,
                this._combineOperator
            );
        }

        return parent;
    }

    hasColumn(column) {
        return this.condition.hasColumn( column );
    }

    // обходим все объекты ConditionElement
    each(iterator, context) {
        if ( !_.isFunction(iterator) ) {
            return;
        }

        this.condition.each(iterator, context);
    }
    
    getColumns() {
        let columns = {};
        this.each(element => {
            let key = element && element[0];
            if ( key ) {
                columns[ key ] = true;
            }
        });
        
        return Object.keys(columns);
    }
}

// need for tests
if ( typeof window !== "undefined" ) {
    if ( typeof window.tests !== "undefined" ) {
        window.tests.Filter = Filter;
    }
}

module.exports = Filter;
