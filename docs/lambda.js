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
var LambdaVisitor = /** @class */ (function () {
    function LambdaVisitor() {
    }
    LambdaVisitor.prototype.do_visit = function (node) {
        return node._accept(this);
    };
    return LambdaVisitor;
}());
exports.LambdaVisitor = LambdaVisitor;
var Lambda = /** @class */ (function () {
    function Lambda(_id) {
        this._id = _id;
    }
    Lambda.prototype.id = function () {
        return this._id;
    };
    Lambda.prototype.alias = function () {
        return this._alias;
    };
    Lambda.prototype.isApplication = function () {
        return false;
    };
    Lambda.prototype.isAbstraction = function () {
        return false;
    };
    Lambda.prototype.isVariable = function () {
        return false;
    };
    Lambda.prototype.isGlobalDef = function () {
        return false;
    };
    return Lambda;
}());
exports.Lambda = Lambda;
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    function Application(id, _func, _arg) {
        var _this = _super.call(this, id) || this;
        _this._func = _func;
        _this._arg = _arg;
        return _this;
    }
    Application.prototype.func = function () {
        return this._func;
    };
    Application.prototype.arg = function () {
        return this._arg;
    };
    Application.prototype.isApplication = function () {
        return true;
    };
    Application.prototype.isRedex = function () {
        return this.func().isAbstraction();
    };
    Application.prototype._accept = function (visitor) {
        return visitor.visit_appl(this);
    };
    return Application;
}(Lambda));
exports.Application = Application;
var Definition = /** @class */ (function (_super) {
    __extends(Definition, _super);
    function Definition() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._usages = [];
        return _this;
    }
    Definition.prototype.usages = function () {
        return this._usages;
    };
    return Definition;
}(Lambda));
exports.Definition = Definition;
var Abstraction = /** @class */ (function (_super) {
    __extends(Abstraction, _super);
    function Abstraction(id, _name, _body) {
        var _this = _super.call(this, id) || this;
        _this._name = _name;
        _this._body = _body;
        return _this;
    }
    Abstraction.prototype.name = function () {
        return this._name;
    };
    Abstraction.prototype.body = function () {
        return this._body;
    };
    Abstraction.prototype.isAbstraction = function () {
        return true;
    };
    Abstraction.prototype._accept = function (visitor) {
        return visitor.visit_abst(this);
    };
    return Abstraction;
}(Definition));
exports.Abstraction = Abstraction;
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(id, _name) {
        var _this = _super.call(this, id) || this;
        _this._name = _name;
        return _this;
    }
    Variable.prototype.name = function () {
        return this._name;
    };
    Variable.prototype.def = function () {
        return this._def;
    };
    Variable.prototype.isVariable = function () {
        return true;
    };
    Variable.prototype.isBound = function () {
        return this.def() && this.def().isAbstraction();
    };
    Variable.prototype._accept = function (visitor) {
        return visitor.visit_var(this);
    };
    return Variable;
}(Lambda));
exports.Variable = Variable;
var GlobalDef = /** @class */ (function (_super) {
    __extends(GlobalDef, _super);
    function GlobalDef(id, _name, _def) {
        var _this = _super.call(this, id) || this;
        _this._name = _name;
        _this._def = _def;
        _def._alias = _this;
        return _this;
    }
    GlobalDef.prototype.name = function () {
        return this._name;
    };
    GlobalDef.prototype.def = function () {
        return this._def;
    };
    GlobalDef.prototype._accept = function (visitor) {
        return visitor.visit_gdef(this);
    };
    GlobalDef.prototype.isGlobalDef = function () {
        return true;
    };
    return GlobalDef;
}(Definition));
exports.GlobalDef = GlobalDef;
var LambdaFactory = /** @class */ (function () {
    function LambdaFactory() {
        this.nextId = 1;
    }
    LambdaFactory.prototype.newVariable = function (name) {
        return new Variable(this.next(), name);
    };
    LambdaFactory.prototype.newAbstraction = function (name, body) {
        return new Abstraction(this.next(), name, body);
    };
    LambdaFactory.prototype.newApplication = function (func, arg) {
        return new Application(this.next(), func, arg);
    };
    LambdaFactory.prototype.newGlobalDefiniton = function (name, def) {
        return new GlobalDef(this.next(), name, def);
    };
    LambdaFactory.prototype.next = function () {
        return this.nextId++;
    };
    LambdaFactory.prototype.clone = function (lmb) {
        return new CloneVisitor(this).do_visit(lmb);
    };
    LambdaFactory.prototype.reduce = function (lmb, redex) {
        if (!redex.isRedex()) {
            throw "Is no redex!";
        }
        return new CloneVisitor(this, redex).do_visit(lmb);
    };
    return LambdaFactory;
}());
exports.LambdaFactory = LambdaFactory;
var CloneVisitor = /** @class */ (function (_super) {
    __extends(CloneVisitor, _super);
    function CloneVisitor(factory, redex) {
        if (redex === void 0) { redex = undefined; }
        var _this = _super.call(this) || this;
        _this.factory = factory;
        _this.redex = redex;
        _this.usage = {};
        _this.changed = false;
        return _this;
    }
    CloneVisitor.prototype.visit_appl = function (node) {
        if (node == this.redex) {
            var abst = (node.func());
            this.replaceVarDef = abst;
            this.replaceDef = node.arg();
            var body = this.do_visit(abst.body());
            this.replaceDef = undefined;
            this.replaceVarDef = undefined;
            this.changed = true;
            return body;
        }
        else {
            var inCh = this.changed;
            var func = this.do_visit(node.func());
            var argCh = this.changed;
            this.changed = inCh;
            var arg = this.do_visit(node.arg());
            this.changed = this.changed || argCh;
            var newN = this.factory.newApplication(func, arg);
            if (!this.changed)
                newN._alias = node._alias;
            return newN;
        }
    };
    CloneVisitor.prototype.visit_abst = function (node) {
        var usages = [];
        this.usage[node.id()] = usages;
        var body = this.do_visit(node.body());
        var newN = this.factory.newAbstraction(node.name(), body);
        if (usages.length != node._usages.length) {
            console.log("not equal!");
        }
        if (!this.changed)
            newN._alias = node._alias;
        if (usages.length > 0) {
            newN._usages = usages;
            for (var _i = 0, usages_1 = usages; _i < usages_1.length; _i++) {
                var use = usages_1[_i];
                use._def = newN;
            }
        }
        return newN;
    };
    CloneVisitor.prototype.visit_var = function (node) {
        var name = node.name();
        var newN = this.factory.newVariable(name);
        if (!this.changed)
            newN._alias = node._alias;
        var def = node.def();
        if (def) {
            if (def == this.replaceVarDef) {
                return this.do_visit(this.replaceDef);
            }
            else {
                var id = def.id();
                (this.usage[id] || (this.usage[id] = [])).push(newN);
            }
        }
        return newN;
    };
    CloneVisitor.prototype.visit_gdef = function (node) {
        var name = node.name();
        var def = this.do_visit(node.def());
        var newN = this.factory.newGlobalDefiniton(name, def);
        if (!this.changed)
            newN._alias = node._alias;
        return newN;
    };
    return CloneVisitor;
}(LambdaVisitor));
//# sourceMappingURL=lambda.js.map