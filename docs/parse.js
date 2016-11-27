"use strict";
const grammar = require("./grammar.pegjs");
function parse(code, factory) {
    function makeParameter(body, params) {
        for (let param of params.reverse()) {
            body = factory.newAbstraction(param, body);
        }
        return body;
    }
    function convert(node) {
        switch (node.type) {
            case "def":
                {
                    let n = node;
                    return factory.newGlobalDefiniton(n.name, makeParameter(convert(n.def), n.params));
                }
            case "abstr":
                {
                    let n = node;
                    return makeParameter(convert(n.expr), n.vars);
                }
            case "appl":
                {
                    let n = node;
                    let func = convert(n.func);
                    for (let arg of n.args) {
                        func = factory.newApplication(func, convert(arg));
                    }
                    return func;
                }
            case "var":
                {
                    let n = node;
                    return factory.newVariable(n.id);
                }
        }
        throw "internal error: unknown node type " + node.type;
    }
    let root = grammar.parse(code);
    return convert(root);
}
exports.parse = parse;
//# sourceMappingURL=parse.js.map