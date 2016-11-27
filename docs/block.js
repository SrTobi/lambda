"use strict";
const lambda_1 = require('./lambda');
const parse_1 = require('./parse');
class Block {
    constructor(factory, _parent, onRecompile) {
        this.factory = factory;
        this._parent = _parent;
        this.onRecompile = onRecompile;
        this.defs = {};
        this.exprs = [];
        this.code = "";
        if (_parent) {
            _parent.child = this;
        }
    }
    setCode(code) {
        this.code = code;
        this.compile();
    }
    lookup(name) {
        let def = this.defs[name];
        if (def) {
            return def;
        }
    }
    definitions() {
        let defs = [];
        for (let def in this.defs) {
            defs.push(this.defs[def]);
        }
        return defs;
    }
    expressions() {
        return this.exprs;
    }
    compile() {
        let code = this.code.replace(/\r?\n(?=[^\n\r])\s/, " ");
        let lines = code.split(/[;\n]/);
        this.exprs = [];
        for (let line of lines) {
            line = line.replace(/^\s+|\s+$/g, '');
            if (line.length) {
                console.log("line: " + line);
                let ast = parse_1.parse(line, this.factory);
                let visitor = new ResolveVisitor(this, this.factory);
                let checked_ast = visitor.do_visit(ast);
                if (checked_ast.isGlobalDef()) {
                    let def = checked_ast;
                    this.defs[def.name()] = def;
                }
                else {
                    this.exprs.push(checked_ast);
                }
            }
        }
        if (this.onRecompile) {
            this.onRecompile(this);
        }
        if (this.child) {
            this.child.compile();
        }
    }
}
exports.Block = Block;
class ResolveVisitor extends lambda_1.LambdaVisitor {
    constructor(context, factory) {
        super();
        this.context = context;
        this.factory = factory;
        this.defs = {};
    }
    visit_appl(node) {
        node._func = this.do_visit(node.func());
        node._arg = this.do_visit(node.arg());
        return node;
    }
    visit_abst(node) {
        let name = node.name();
        let old = this.defs[name];
        this.defs[name] = node;
        node._body = this.do_visit(node.body());
        this.defs[name] = old;
        return node;
    }
    visit_var(node) {
        let name = node.name();
        let def = this.defs[name];
        if (def) {
            node._def = def;
            def._usages.push(node);
        }
        else {
            let ref = this.context.lookup(name);
            if (ref) {
                return this.factory.clone(ref.def());
            }
        }
        return node;
    }
    visit_gdef(node) {
        node._def = this.do_visit(node.def());
        return node;
    }
}
//# sourceMappingURL=block.js.map