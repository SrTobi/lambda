"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lambda_1 = require("./lambda");
var block_1 = require("./block");
var textPrinter_1 = require("./textPrinter");
var evaluate_1 = require("./evaluate");
var fac = new lambda_1.LambdaFactory();
var c = new block_1.Block(fac);
c.setCode("pair a b f = f a b; fst p = p (\\a b -> a); snd p = p (\\a b -> b); double a = pair a a; swap p = p (\\a b -> pair b a);func = snd (swap (pair c d))");
var func = c.lookup("func");
c.definitions().forEach(function (func) { return console.log(textPrinter_1.to_string(func, { expand_alias: false, print_id: false, print_def: true })); });
if (func) {
    var list = evaluate_1.reduceAll(func.def(), evaluate_1.strategy.normal, fac);
    console.log("list-size: " + list.length);
    list.forEach(function (step) { return console.log(textPrinter_1.to_string(step, { expand_alias: false, print_id: false, print_def: false })); });
}
//# sourceMappingURL=test.js.map