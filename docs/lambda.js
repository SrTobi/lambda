"use strict";
class LambdaVisitor {
    do_visit(node) {
        return node._accept(this);
    }
}
exports.LambdaVisitor = LambdaVisitor;
class Lambda {
    constructor(_id) {
        this._id = _id;
    }
    id() {
        return this._id;
    }
    alias() {
        return this._alias;
    }
    isApplication() {
        return false;
    }
    isAbstraction() {
        return false;
    }
    isVariable() {
        return false;
    }
    isGlobalDef() {
        return false;
    }
}
exports.Lambda = Lambda;
class Application extends Lambda {
    constructor(id, _func, _arg) {
        super(id);
        this._func = _func;
        this._arg = _arg;
    }
    func() {
        return this._func;
    }
    arg() {
        return this._arg;
    }
    isApplication() {
        return true;
    }
    isRedex() {
        return this.func().isAbstraction();
    }
    _accept(visitor) {
        return visitor.visit_appl(this);
    }
}
exports.Application = Application;
class Definition extends Lambda {
    constructor() {
        super(...arguments);
        this._usages = [];
    }
    usages() {
        return this._usages;
    }
}
exports.Definition = Definition;
class Abstraction extends Definition {
    constructor(id, _name, _body) {
        super(id);
        this._name = _name;
        this._body = _body;
    }
    name() {
        return this._name;
    }
    body() {
        return this._body;
    }
    isAbstraction() {
        return true;
    }
    _accept(visitor) {
        return visitor.visit_abst(this);
    }
}
exports.Abstraction = Abstraction;
class Variable extends Lambda {
    constructor(id, _name) {
        super(id);
        this._name = _name;
    }
    name() {
        return this._name;
    }
    def() {
        return this._def;
    }
    isVariable() {
        return true;
    }
    isBound() {
        return this.def() && this.def().isAbstraction();
    }
    _accept(visitor) {
        return visitor.visit_var(this);
    }
}
exports.Variable = Variable;
class GlobalDef extends Definition {
    constructor(id, _name, _def) {
        super(id);
        this._name = _name;
        this._def = _def;
        _def._alias = this;
    }
    name() {
        return this._name;
    }
    def() {
        return this._def;
    }
    _accept(visitor) {
        return visitor.visit_gdef(this);
    }
    isGlobalDef() {
        return true;
    }
}
exports.GlobalDef = GlobalDef;
class LambdaFactory {
    constructor() {
        this.nextId = 1;
    }
    newVariable(name) {
        return new Variable(this.next(), name);
    }
    newAbstraction(name, body) {
        return new Abstraction(this.next(), name, body);
    }
    newApplication(func, arg) {
        return new Application(this.next(), func, arg);
    }
    newGlobalDefiniton(name, def) {
        return new GlobalDef(this.next(), name, def);
    }
    next() {
        return this.nextId++;
    }
    clone(lmb) {
        return new CloneVisitor(this).do_visit(lmb);
    }
    reduce(lmb, redex) {
        if (!redex.isRedex()) {
            throw "Is no redex!";
        }
        return new CloneVisitor(this, redex).do_visit(lmb);
    }
}
exports.LambdaFactory = LambdaFactory;
class CloneVisitor extends LambdaVisitor {
    constructor(factory, redex = undefined) {
        super();
        this.factory = factory;
        this.redex = redex;
        this.usage = {};
        this.changed = false;
    }
    visit_appl(node) {
        if (node == this.redex) {
            let abst = (node.func());
            this.replaceVarDef = abst;
            this.replaceDef = node.arg();
            let body = this.do_visit(abst.body());
            this.replaceDef = undefined;
            this.replaceVarDef = undefined;
            this.changed = true;
            return body;
        }
        else {
            let func = this.do_visit(node.func());
            let oldCh = this.changed;
            let arg = this.do_visit(node.arg());
            this.changed = this.changed || oldCh;
            let newN = this.factory.newApplication(func, arg);
            if (!this.changed)
                newN._alias = node._alias;
            return newN;
        }
    }
    visit_abst(node) {
        let body = this.do_visit(node.body());
        let newN = this.factory.newAbstraction(node.name(), body);
        if (!this.changed)
            newN._alias = node._alias;
        newN._usages = this.usage[node.id()];
        if (newN._usages) {
            for (let use of newN._usages) {
                use._def = newN;
            }
        }
        return newN;
    }
    visit_var(node) {
        let name = node.name();
        let newN = this.factory.newVariable(name);
        if (!this.changed)
            newN._alias = node._alias;
        let def = node.def();
        if (def) {
            if (def == this.replaceVarDef) {
                return this.do_visit(this.replaceDef);
            }
            else {
                let id = def.id();
                (this.usage[id] || (this.usage[id] = [])).push(newN);
            }
        }
        return newN;
    }
    visit_gdef(node) {
        let name = node.name();
        let def = this.do_visit(node.def());
        let newN = this.factory.newGlobalDefiniton(name, def);
        if (!this.changed)
            newN._alias = node._alias;
        return newN;
    }
}
//# sourceMappingURL=lambda.js.map