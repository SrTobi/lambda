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
var parse_1 = require("./parse");
var Block = /** @class */ (function () {
    function Block(factory, _parent, onRecompile) {
        this.factory = factory;
        this._parent = _parent;
        this.onRecompile = onRecompile;
        this.defs = {};
        this.exprs = [];
        this.code = "";
        this.enabled = true;
        if (_parent) {
            _parent.child = this;
        }
    }
    Block.prototype.enable = function (enable) {
        var wasEnabled = this.enabled;
        this.enabled = enable;
        this.compile();
        if (wasEnabled != enable && this.child) {
            this.child.compile();
        }
    };
    Block.prototype.isEnabled = function () {
        return this.enabled;
    };
    Block.prototype.setCode = function (code) {
        this.code = code;
        this.compile();
    };
    Block.prototype.lookup = function (name) {
        var def = this.defs[name];
        if (def) {
            return def;
        }
        else if (this._parent) {
            return this._parent.lookup(name);
        }
        return undefined;
    };
    Block.prototype.definitions = function () {
        var defs = [];
        for (var def in this.defs) {
            defs.push(this.defs[def]);
        }
        return defs;
    };
    Block.prototype.expressions = function () {
        return this.exprs;
    };
    Block.prototype.compile = function () {
        this.defs = {};
        this.exprs = [];
        if (!this.enabled) {
            return;
        }
        var entities = parse_1.parse(this.code, this.factory);
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            var visitor = new ResolveVisitor(this, this.factory);
            var ast = visitor.do_visit(entity);
            if (ast.isGlobalDef()) {
                var def = ast;
                this.defs[def.name()] = def;
            }
            else {
                this.exprs.push(ast);
            }
        }
        if (this.onRecompile) {
            this.onRecompile(this);
        }
        if (this.child) {
            this.child.compile();
        }
    };
    return Block;
}());
exports.Block = Block;
var ResolveVisitor = /** @class */ (function (_super) {
    __extends(ResolveVisitor, _super);
    function ResolveVisitor(context, factory) {
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.factory = factory;
        _this.defs = {};
        return _this;
    }
    ResolveVisitor.prototype.visit_appl = function (node) {
        node._func = this.do_visit(node.func());
        node._arg = this.do_visit(node.arg());
        return node;
    };
    ResolveVisitor.prototype.visit_abst = function (node) {
        var name = node.name();
        var old = this.defs[name];
        this.defs[name] = node;
        node._body = this.do_visit(node.body());
        this.defs[name] = old;
        return node;
    };
    ResolveVisitor.prototype.visit_var = function (node) {
        var name = node.name();
        var def = this.defs[name];
        if (def) {
            node._def = def;
            def._usages.push(node);
        }
        else {
            var ref = this.context.lookup(name);
            if (ref) {
                return this.factory.clone(ref.def());
            }
        }
        return node;
    };
    ResolveVisitor.prototype.visit_gdef = function (node) {
        node._def = this.do_visit(node.def());
        return node;
    };
    return ResolveVisitor;
}(lambda_1.LambdaVisitor));
//# sourceMappingURL=block.js.map