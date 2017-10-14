"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lambda_1 = require("./lambda");
var strategy;
(function (strategy) {
    function normal(lmb) {
        return new NormalReduceVisitor().do_visit(lmb);
    }
    strategy.normal = normal;
    function callByValue(lmb) {
        return new CallByValueReduceVisitor().do_visit(lmb);
    }
    strategy.callByValue = callByValue;
    function callByName(lmb) {
        return new CallByNameReduceVisitor().do_visit(lmb);
    }
    strategy.callByName = callByName;
})(strategy = exports.strategy || (exports.strategy = {}));
function reduce(lmb, strategy, factory) {
    var redex = strategy(lmb);
    return redex ? factory.reduce(lmb, redex) : undefined;
}
exports.reduce = reduce;
function reduceAll(lmb, strategy, factory) {
    var steps = [lmb];
    var step;
    while (step = reduce(lmb, strategy, factory)) {
        steps.push(step);
        lmb = step;
    }
    return steps;
}
exports.reduceAll = reduceAll;
var Reducer = /** @class */ (function () {
    function Reducer(initLambda, strategy, factory) {
        this.initLambda = initLambda;
        this.strategy = strategy;
        this.factory = factory;
        this.reduced = [];
        this.running = false;
        this.curLambda = initLambda;
        this.result = [initLambda];
    }
    Reducer.prototype.run = function (result, abort) {
        this.running = true;
        this.next(result, abort || (function () { }));
    };
    Reducer.prototype.stop = function () {
        this.running = false;
    };
    Reducer.prototype.next = function (result, abort) {
        var _this = this;
        if (!this.running) {
            abort();
        }
        else if (this.curLambda) {
            requestAnimationFrame(function () {
                _this.step();
                _this.next(result, abort);
            });
        }
        else {
            console.log("end");
            this.stop();
            result(this.result, this.reduced);
        }
    };
    Reducer.prototype.step = function () {
        for (var i = 0; i < 10; ++i) {
            if (!this.curLambda) {
                return;
            }
            var redex = this.strategy(this.curLambda);
            if (!redex) {
                this.curLambda = undefined;
                return;
            }
            this.curLambda = this.factory.reduce(this.curLambda, redex);
            if (this.curLambda) {
                this.result.push(this.curLambda);
                this.reduced.push(redex);
            }
        }
    };
    return Reducer;
}());
exports.Reducer = Reducer;
var NormalReduceVisitor = /** @class */ (function (_super) {
    __extends(NormalReduceVisitor, _super);
    function NormalReduceVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NormalReduceVisitor.prototype.visit_appl = function (node) {
        if (node.isRedex()) {
            return node;
        }
        var redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    };
    NormalReduceVisitor.prototype.visit_abst = function (node) {
        return this.do_visit(node.body());
    };
    NormalReduceVisitor.prototype.visit_var = function (node) {
        return undefined;
    };
    NormalReduceVisitor.prototype.visit_gdef = function (node) {
        return this.do_visit(node.def());
    };
    return NormalReduceVisitor;
}(lambda_1.LambdaVisitor));
var CallByNameReduceVisitor = /** @class */ (function (_super) {
    __extends(CallByNameReduceVisitor, _super);
    function CallByNameReduceVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallByNameReduceVisitor.prototype.visit_appl = function (node) {
        if (node.isRedex()) {
            return node;
        }
        var redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    };
    CallByNameReduceVisitor.prototype.visit_abst = function (node) {
        return undefined;
    };
    CallByNameReduceVisitor.prototype.visit_var = function (node) {
        return undefined;
    };
    CallByNameReduceVisitor.prototype.visit_gdef = function (node) {
        return this.do_visit(node.def());
    };
    return CallByNameReduceVisitor;
}(lambda_1.LambdaVisitor));
function isValue(node) {
    return node.isAbstraction();
}
var CallByValueReduceVisitor = /** @class */ (function (_super) {
    __extends(CallByValueReduceVisitor, _super);
    function CallByValueReduceVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallByValueReduceVisitor.prototype.visit_appl = function (node) {
        if (node.isRedex() && isValue(node.arg())) {
            return node;
        }
        var redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    };
    CallByValueReduceVisitor.prototype.visit_abst = function (node) {
        return undefined;
    };
    CallByValueReduceVisitor.prototype.visit_var = function (node) {
        return undefined;
    };
    CallByValueReduceVisitor.prototype.visit_gdef = function (node) {
        return this.do_visit(node.def());
    };
    return CallByValueReduceVisitor;
}(lambda_1.LambdaVisitor));
//# sourceMappingURL=evaluate.js.map