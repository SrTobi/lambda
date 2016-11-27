import * as L from './lambda';
import {LambdaFactory, Lambda} from './lambda';
//import * as grammar from './grammar'
declare var require: any;

interface Node {
    type: string
}

interface Definition extends Node {
    type: "def",
    name: string,
    params: string[],
    def: Node
}

interface Abstraction extends Node {
    type: "abstr",
    vars: string[],
    expr: Node
}

interface Application extends Node {
    type: "appl",
    func: Node,
    args: Node[]
}

interface Var extends Node {
    type: "var",
    id: string
}

const grammar: PEG.Parser = require("./grammar.pegjs");

export function parse(code: string, factory: LambdaFactory): Lambda {

    function makeParameter(body: Lambda, params: string[]): Lambda {
        for(let param of params.reverse()) {
            body = factory.newAbstraction(param, body);
        }
        return body;
    }

    function convert(node: Node): Lambda {
        switch(node.type)
        {
        case "def":
            {
                let n = node as Definition;
                return factory.newGlobalDefiniton(n.name, makeParameter(convert(n.def), n.params));
            }

        case "abstr":
            {
                let n = node as Abstraction;
                return makeParameter(convert(n.expr), n.vars);
            }

        case "appl":
            {
                let n = node as Application;
                let func = convert(n.func);
                for(let arg of n.args) {
                    func = factory.newApplication(func, convert(arg));
                }
                return func;
            }

        case "var":
            {
                let n = node as Var;
                return factory.newVariable(n.id);
            }
        }
        throw "internal error: unknown node type " + node.type;
    }

    let root: Node = grammar.parse(code);

    return convert(root);
}