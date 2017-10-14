"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grammar = require("./grammar.pegjs");
function parse(code, factory) {
    function makeParameter(body, params) {
        for (var _i = 0, _a = params.reverse(); _i < _a.length; _i++) {
            var param = _a[_i];
            body = factory.newAbstraction(param, body);
        }
        return body;
    }
    function convert(node) {
        switch (node.type) {
            case "def":
                {
                    var n = node;
                    return factory.newGlobalDefiniton(n.name, makeParameter(convert(n.def), n.params));
                }
            case "abstr":
                {
                    var n = node;
                    return makeParameter(convert(n.expr), n.vars);
                }
            case "appl":
                {
                    var n = node;
                    var func = convert(n.func);
                    for (var _i = 0, _a = n.args; _i < _a.length; _i++) {
                        var arg = _a[_i];
                        func = factory.newApplication(func, convert(arg));
                    }
                    return func;
                }
            case "var":
                {
                    var n = node;
                    return factory.newVariable(n.id);
                }
        }
        throw "internal error: unknown node type " + node.type;
    }
    var root = grammar.parse(code);
    return root.entities.map(convert);
}
exports.parse = parse;
//# sourceMappingURL=parse.js.map