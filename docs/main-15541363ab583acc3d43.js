webpackJsonp([0,2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const React = __webpack_require__(1);
	const ReactDOM = __webpack_require__(32);
	const inputPanel_1 = __webpack_require__(178);
	const lambda_1 = __webpack_require__(180);
	__webpack_require__(184);
	__webpack_require__(185);
	__webpack_require__(186);
	__webpack_require__(195);
	class GUI extends React.Component {
	    constructor() {
	        super();
	        this.factory = new lambda_1.LambdaFactory();
	        this.state = { text: "Test" };
	    }
	    settingsChanged() {
	    }
	    render() {
	        return (React.createElement("div", null, 
	            React.createElement("div", {className: "container"}, 
	                React.createElement("div", {className: "page-header"}, 
	                    React.createElement("h1", null, 
	                        "Lambda ", 
	                        React.createElement("small", null))
	                ), 
	                React.createElement(inputPanel_1.InputPanel, {factory: this.factory}))
	        ));
	    }
	}
	var target = document.createElement("div");
	ReactDOM.render(React.createElement(GUI, null), target);
	document.body.appendChild(target);


/***/ },

/***/ 178:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const React = __webpack_require__(1);
	const block_1 = __webpack_require__(179);
	const textPrinter_1 = __webpack_require__(182);
	const ev = __webpack_require__(183);
	class InputBlock extends React.Component {
	    constructor(factory, parent) {
	        super();
	        this.factory = factory;
	        this.block = new block_1.Block(factory, parent, () => { this.onCompile(); });
	    }
	    onCompile() {
	        let exprs = this.block.expressions();
	        this.setState({
	            evals: exprs.map((expr) => {
	                return ev.reduceAll(expr, ev.normalReduce, this.factory);
	            })
	        });
	    }
	    onSubmit(event) {
	        if (event.keyCode == 13) {
	            if (event.ctrlKey) {
	                this.block.compile();
	            }
	            else if (event.shiftKey) {
	                this.block.compile();
	            }
	        }
	    }
	    render() {
	        return (React.createElement("div", null, 
	            React.createElement("div", {className: "inputArea", contentEditable: true, onKeyUp: (o) => this.onSubmit(o)}, "a.b.a b"), 
	            React.createElement("div", null, this.state.evals.map((lmbs) => {
	                return (React.createElement("div", null, lmbs.map((lmb) => React.createElement("p", null, textPrinter_1.to_string(lmb)))));
	            }))));
	    }
	}
	class InputPanel extends React.Component {
	    constructor() {
	        super();
	        this.setState([new InputBlock(this.props.factory)]);
	    }
	    render() {
	        return (React.createElement("div", {className: "panel panel-default config-panel"}, 
	            React.createElement("div", {className: "panel-heading"}, 
	                React.createElement("h3", {className: "panel-title"}, 
	                    React.createElement("a", {"data-toggle": "collapse", "data-target": ".panel-body"}, "Settings")
	                )
	            ), 
	            React.createElement("div", {className: "panel-body collapse in"}, this.state)));
	    }
	}
	exports.InputPanel = InputPanel;


/***/ },

/***/ 179:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const lambda_1 = __webpack_require__(180);
	const parse_1 = __webpack_require__(181);
	class Block {
	    constructor(factory, _parent, onRecompile) {
	        this.factory = factory;
	        this._parent = _parent;
	        this.onRecompile = onRecompile;
	        this.defs = {};
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
	        let code = this.code.replace(/\r?\n\s/, " ");
	        let lines = code.split(/[;\n]/);
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


/***/ },

/***/ 180:
/***/ function(module, exports) {

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
	            this.replaceDef = this.do_visit(node.arg());
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
	                return this.replaceDef;
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


/***/ },

/***/ 181:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const grammar = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./grammar\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
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


/***/ },

/***/ 182:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const lambda_1 = __webpack_require__(180);
	function to_string(l, opts = {}) {
	    if (opts.print_id) {
	        opts.print_paren = true;
	    }
	    return tos(l, false, false);
	    function tos(lmb, inAppl, firstInAppl) {
	        class ToStringVisitor extends lambda_1.LambdaVisitor {
	            visit_appl(node) {
	                let f = tos(node.func(), true, true);
	                let a = tos(node.arg(), true, false);
	                return this.p(`${f} ${a}`, { paren: inAppl && !firstInAppl });
	            }
	            visit_abst(node) {
	                let name = node.name();
	                let body = tos(node.body(), false, false);
	                return this.p(`\\${name}.${body}`, { paren: inAppl });
	            }
	            visit_var(node) {
	                return this.p(node.name(), { def: node.def() });
	            }
	            visit_gdef(node) {
	                let name = node.name();
	                let def = tos(node.def(), false, false);
	                return this.p(`${name} = ${def}`);
	            }
	            appedix(info) {
	                let result = [];
	                if (opts.print_id) {
	                    result.push(`id=${lmb.id()}`);
	                }
	                if (opts.print_def && info.def) {
	                    result.push(`def=${info.def.id()}`);
	                }
	                return result.length ? `[${result.join(",")}]` : "";
	            }
	            p(str, info = {}) {
	                return (opts.print_paren || info.paren ? `(${str})` : str) + this.appedix(info);
	            }
	        }
	        let alias = lmb.alias();
	        if (alias && l != alias && !opts.expand_alias) {
	            return alias.name();
	        }
	        let v = new ToStringVisitor();
	        return v.do_visit(lmb);
	    }
	}
	exports.to_string = to_string;


/***/ },

/***/ 183:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const lambda_1 = __webpack_require__(180);
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


/***/ },

/***/ 195:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(196);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(194)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 196:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(188)();
	// imports
	
	
	// module
	exports.push([module.id, "body {\n    background-color: whitesmoke;\n}\n\n.inputArea {\n    width: auto;\n    background-color: whitesmoke;\n    border: solid 1px darkgray;\n    padding: 2px;\n}\n\n.transition-prob-control input {\n    margin: 4px;\n    width: 80px;\n    text-align: center;\n}", ""]);
	
	// exports


/***/ }

});
//# sourceMappingURL=main-15541363ab583acc3d43.js.map