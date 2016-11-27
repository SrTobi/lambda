"use strict";
const lambda_1 = require('./lambda');
const block_1 = require('./block');
const textPrinter_1 = require('./textPrinter');
const evaluate_1 = require('./evaluate');
let fac = new lambda_1.LambdaFactory();
let c = new block_1.Block(fac);
c.setCode("pair a b f = f a b; fst p = p (\\a b -> a); snd p = p (\\a b -> b); double a = pair a a; swap p = p (\\a b -> pair b a);func = snd (swap (pair c d))");
let func = c.lookup("func");
c.definitions().forEach((func) => console.log(textPrinter_1.to_string(func, { expand_alias: false, print_id: false, print_def: true })));
if (func) {
    let list = evaluate_1.reduceAll(func.def(), evaluate_1.normalReduce, fac);
    console.log("list-size: " + list.length);
    list.forEach((step) => console.log(textPrinter_1.to_string(step, { expand_alias: false, print_id: false, print_def: false })));
}
//# sourceMappingURL=test.js.map