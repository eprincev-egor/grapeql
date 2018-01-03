"use strict";

const Syntax = require("./Syntax");

class CaseWhen extends Syntax {
    parse(coach) {
        
        coach.expectWord("case");
        coach.skipSpace();
        
        this.case = [];
        this.parseElement(coach);
        
        coach.skipSpace();
        if ( coach.isWord("else") ) {
            coach.readWord();
            coach.skipSpace();
            this.else = coach.parseExpression();
            coach.skipSpace();
        } else {
            this.else = null;
        }
        
        coach.expectWord("end");
    }
    
    parseElement(coach) {
        let elem = coach.parseCaseWhenElement();
        this.case.push(elem);
        
        coach.skipSpace();
        if ( coach.isCaseWhenElement() ) {
            this.parseElement(coach);
        }
    }
    
    is(coach) {
        return coach.isWord("case");
    }
}

CaseWhen.tests = [
    {
        str: "case when (true) then 1 else 0 end",
        result: {
            case: [
                {
                    when: {elements: [{boolean: true}]},
                    then: {elements: [{number: "1"}]}
                }
            ],
            else: {elements: [{number: "0"}]}
        }
    },
    
    {
        str: "case when 'some' then (1+1) when true or false then (1+1) else -2 end",
        result: {
            case: [
                {
                    when: {elements: [{content: "some"}]},
                    then: {elements: [
                        {number: "1"},
                        {operator: "+"},
                        {number: "1"}
                    ]}
                },
                {
                    when: {elements: [
                        {boolean: true},
                        {operator: "or"},
                        {boolean: false}
                    ]},
                    then: {elements: [
                        {number: "1"},
                        {operator: "+"},
                        {number: "1"}
                    ]}
                }
            ],
            else: {elements: [
                {operator: "-"},
                {number: "2"}
            ]}
        }
    }
];

module.exports = CaseWhen;
