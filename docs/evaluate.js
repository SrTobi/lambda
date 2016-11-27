"use strict";
const lambda_1 = require('./lambda');
function normalReduce(lmb) {
    return new NormalReduceVisitor().do_visit(lmb);
}
exports.normalReduce = normalReduce;
function reduce(lmb, strategy, factory) {
    let redex = strategy(lmb);
    return redex ? factory.reduce(lmb, redex) : undefined;
}
exports.reduce = reduce;
function reduceAll(lmb, strategy, factory) {
    let steps = [lmb];
    let step;
    while (step = reduce(lmb, strategy, factory)) {
        steps.push(step);
        lmb = step;
    }
    return steps;
}
exports.reduceAll = reduceAll;
class NormalReduceVisitor extends lambda_1.LambdaVisitor {
    visit_appl(node) {
        if (node.isRedex()) {
            return node;
        }
        let redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    }
    visit_abst(node) {
        return this.do_visit(node.body());
    }
    visit_var(node) {
        return undefined;
    }
    visit_gdef(node) {
        return this.do_visit(node.def());
    }
}
//# sourceMappingURL=evaluate.js.map