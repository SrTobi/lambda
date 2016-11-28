webpackJsonp([0,2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const React = __webpack_require__(1);
	const ReactDOM = __webpack_require__(32);
	const inputPanel_1 = __webpack_require__(178);
	const lambda_1 = __webpack_require__(180);
	__webpack_require__(193);
	__webpack_require__(194);
	__webpack_require__(195);
	__webpack_require__(204);
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
	const textPrinter_1 = __webpack_require__(183);
	const ev = __webpack_require__(184);
	const utils = __webpack_require__(185);
	const Visual = __webpack_require__(186);
	const react_ace_1 = __webpack_require__(187);
	class InputBlock extends React.Component {
	    constructor(props) {
	        super(props);
	        this.id = utils.randomString(12);
	        this.code = this.props.value || "";
	        this.block = new block_1.Block(this.props.factory, this.props.parent, () => { this.onCompile(); });
	        this.state = { evals: [], error: undefined };
	    }
	    onCompile() {
	        let exprs = this.block.expressions();
	        this.setState({
	            evals: exprs.map((expr) => {
	                return ev.reduceAll(expr, ev.normalReduce, this.props.factory);
	            })
	        });
	    }
	    execute(code, editor) {
	        this.code = code;
	        this.setState({ error: undefined });
	        editor.getSession().setAnnotations([]);
	        try {
	            this.block.setCode(code);
	        }
	        catch (e) {
	            let err = e;
	            this.setState({ error: err.message + " in line " + err.location.start.line + ", column " + err.location.start.column });
	            editor.getSession().setAnnotations([{
	                    row: err.location.start.line - 1,
	                    column: err.location.start.column,
	                    text: err.message,
	                    type: "error" // also warning and information
	                }]);
	        }
	    }
	    onSubmit(editor) {
	        this.execute(editor.getValue(), editor);
	        this.props.onFinish(this.props.index, this.block);
	    }
	    onExecute(editor) {
	        this.execute(editor.getValue(), editor);
	    }
	    render() {
	        let evals = this.state.evals || [];
	        let showAllAppl = this.state.showAllAppl || false;
	        return (React.createElement("div", {className: "input-block"}, 
	            React.createElement("div", {className: "ace-container"}, 
	                React.createElement(react_ace_1.default, {name: this.id, onKeyUp: (o) => this.onSubmit(o), ref: (e) => this.input = e, fontSize: 15, className: "ace-input-area", minLines: 3, maxLines: 150, width: "", focus: true, commands: [{
	                        name: "submit",
	                        bindKey: "shift-enter",
	                        exec: (editor) => this.onSubmit(editor)
	                    }, {
	                        name: "execute",
	                        bindKey: "ctrl-enter",
	                        exec: (editor) => this.onExecute(editor)
	                    }], value: this.code, showPrintMargin: false, editorProps: {
	                    $blockScrolling: true,
	                    enableBasicAutocompletion: true,
	                    enableLiveAutocompletion: true,
	                    tabSize: 2
	                }})
	            ), 
	            React.createElement("div", {className: "config-box"}, 
	                React.createElement(Visual.Switch, {checked: showAllAppl, onChange: (b) => { this.setState({ showAllAppl: b }); }, label: "Show all steps"})
	            ), 
	            this.state.error ?
	                React.createElement("div", {className: "error-box"}, 
	                    "Error: ", 
	                    this.state.error)
	                :
	                    React.createElement("div", {className: "output-box"}, evals.map((lmbs) => {
	                        return (React.createElement("div", {className: "expr-box"}, 
	                            lmbs
	                                .filter((lmb, idx) => showAllAppl || idx == 0 || idx == lmbs.length - 1)
	                                .map((lmb, idx) => React.createElement("div", {className: "appl-box"}, 
	                                idx == 0 ? "" : "=>", 
	                                " ", 
	                                textPrinter_1.to_string(lmb))), 
	                            React.createElement("div", {className: "reduce-box"}, 
	                                lmbs.length - 1, 
	                                " Steps")));
	                    }))));
	    }
	}
	class InputPanel extends React.Component {
	    constructor(props) {
	        super(props);
	        this.state = { blocks: [] };
	        this.addInputBlock(undefined);
	    }
	    addInputBlock(block) {
	        let idx = this.state.blocks.length;
	        let newB = (React.createElement(InputBlock, {factory: this.props.factory, index: idx, parent: block, onFinish: (from, blk) => {
	            if (from + 1 >= this.state.blocks.length) {
	                this.addInputBlock(blk);
	            }
	        }}));
	        this.state.blocks.push(newB);
	        if (this.setState) {
	            this.setState({ blocks: this.state.blocks });
	        }
	    }
	    render() {
	        return (React.createElement("div", {className: "panel panel-default config-panel"}, 
	            React.createElement("div", {className: "panel-heading"}, 
	                React.createElement("h3", {className: "panel-title"}, 
	                    React.createElement("a", {"data-toggle": "collapse", "data-target": ".panel-body"}, "Lambda Evaluator")
	                )
	            ), 
	            React.createElement("div", {className: "panel-body collapse in"}, this.state.blocks)));
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
	        else if (this._parent) {
	            return this._parent.lookup(name);
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
	        this.defs = {};
	        this.exprs = [];
	        let entities = parse_1.parse(this.code, this.factory);
	        for (let entity of entities) {
	            let visitor = new ResolveVisitor(this, this.factory);
	            let ast = visitor.do_visit(entity);
	            if (ast.isGlobalDef()) {
	                let def = ast;
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
	            this.replaceDef = node.arg();
	            let body = this.do_visit(abst.body());
	            this.replaceDef = undefined;
	            this.replaceVarDef = undefined;
	            this.changed = true;
	            return body;
	        }
	        else {
	            let inCh = this.changed;
	            let func = this.do_visit(node.func());
	            let argCh = this.changed;
	            this.changed = inCh;
	            let arg = this.do_visit(node.arg());
	            this.changed = this.changed || argCh;
	            let newN = this.factory.newApplication(func, arg);
	            if (!this.changed)
	                newN._alias = node._alias;
	            return newN;
	        }
	    }
	    visit_abst(node) {
	        let usages = [];
	        this.usage[node.id()] = usages;
	        let body = this.do_visit(node.body());
	        let newN = this.factory.newAbstraction(node.name(), body);
	        if (usages.length != node._usages.length) {
	            console.log("not equal!");
	        }
	        if (!this.changed)
	            newN._alias = node._alias;
	        if (usages.length > 0) {
	            newN._usages = usages;
	            for (let use of usages) {
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


/***/ },

/***/ 181:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const grammar = __webpack_require__(182);
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
	    return root.entities.map(convert);
	}
	exports.parse = parse;


/***/ },

/***/ 182:
/***/ function(module, exports) {

	module.exports = /*
	 * Generated by PEG.js 0.10.0.
	 *
	 * http://pegjs.org/
	 */
	(function() {
	  "use strict";
	
	  function peg$subclass(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }
	
	  function peg$SyntaxError(message, expected, found, location) {
	    this.message  = message;
	    this.expected = expected;
	    this.found    = found;
	    this.location = location;
	    this.name     = "SyntaxError";
	
	    if (typeof Error.captureStackTrace === "function") {
	      Error.captureStackTrace(this, peg$SyntaxError);
	    }
	  }
	
	  peg$subclass(peg$SyntaxError, Error);
	
	  peg$SyntaxError.buildMessage = function(expected, found) {
	    var DESCRIBE_EXPECTATION_FNS = {
	          literal: function(expectation) {
	            return "\"" + literalEscape(expectation.text) + "\"";
	          },
	
	          "class": function(expectation) {
	            var escapedParts = "",
	                i;
	
	            for (i = 0; i < expectation.parts.length; i++) {
	              escapedParts += expectation.parts[i] instanceof Array
	                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
	                : classEscape(expectation.parts[i]);
	            }
	
	            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
	          },
	
	          any: function(expectation) {
	            return "any character";
	          },
	
	          end: function(expectation) {
	            return "end of input";
	          },
	
	          other: function(expectation) {
	            return expectation.description;
	          }
	        };
	
	    function hex(ch) {
	      return ch.charCodeAt(0).toString(16).toUpperCase();
	    }
	
	    function literalEscape(s) {
	      return s
	        .replace(/\\/g, '\\\\')
	        .replace(/"/g,  '\\"')
	        .replace(/\0/g, '\\0')
	        .replace(/\t/g, '\\t')
	        .replace(/\n/g, '\\n')
	        .replace(/\r/g, '\\r')
	        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
	        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
	    }
	
	    function classEscape(s) {
	      return s
	        .replace(/\\/g, '\\\\')
	        .replace(/\]/g, '\\]')
	        .replace(/\^/g, '\\^')
	        .replace(/-/g,  '\\-')
	        .replace(/\0/g, '\\0')
	        .replace(/\t/g, '\\t')
	        .replace(/\n/g, '\\n')
	        .replace(/\r/g, '\\r')
	        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
	        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
	    }
	
	    function describeExpectation(expectation) {
	      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
	    }
	
	    function describeExpected(expected) {
	      var descriptions = new Array(expected.length),
	          i, j;
	
	      for (i = 0; i < expected.length; i++) {
	        descriptions[i] = describeExpectation(expected[i]);
	      }
	
	      descriptions.sort();
	
	      if (descriptions.length > 0) {
	        for (i = 1, j = 1; i < descriptions.length; i++) {
	          if (descriptions[i - 1] !== descriptions[i]) {
	            descriptions[j] = descriptions[i];
	            j++;
	          }
	        }
	        descriptions.length = j;
	      }
	
	      switch (descriptions.length) {
	        case 1:
	          return descriptions[0];
	
	        case 2:
	          return descriptions[0] + " or " + descriptions[1];
	
	        default:
	          return descriptions.slice(0, -1).join(", ")
	            + ", or "
	            + descriptions[descriptions.length - 1];
	      }
	    }
	
	    function describeFound(found) {
	      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
	    }
	
	    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
	  };
	
	  function peg$parse(input, options) {
	    options = options !== void 0 ? options : {};
	
	    var peg$FAILED = {},
	
	        peg$startRuleFunctions = { Block: peg$parseBlock },
	        peg$startRuleFunction  = peg$parseBlock,
	
	        peg$c0 = /^[\n\r \t]/,
	        peg$c1 = peg$classExpectation(["\n", "\r", " ", "\t"], false, false),
	        peg$c2 = function(entities) {
	            return {
	                type: "block",
	                entities: entities.filter((e) => { return e;})
	            };
	        },
	        peg$c3 = /^[\n\r;]/,
	        peg$c4 = peg$classExpectation(["\n", "\r", ";"], false, false),
	        peg$c5 = function(entity) {
	            return entity;
	        },
	        peg$c6 = "--",
	        peg$c7 = peg$literalExpectation("--", false),
	        peg$c8 = "//",
	        peg$c9 = peg$literalExpectation("//", false),
	        peg$c10 = /^[^\n\r]/,
	        peg$c11 = peg$classExpectation(["\n", "\r"], true, false),
	        peg$c12 = function() {
	            return undefined;
	        },
	        peg$c13 = "=",
	        peg$c14 = peg$literalExpectation("=", false),
	        peg$c15 = function(name, params, def) {
	            return {
	                type: "def",
	                name: name,
	                params: params,
	                def: def
	            };
	        },
	        peg$c16 = "(",
	        peg$c17 = peg$literalExpectation("(", false),
	        peg$c18 = ")",
	        peg$c19 = peg$literalExpectation(")", false),
	        peg$c20 = function(exp) {
	            return exp;
	        },
	        peg$c21 = "\\",
	        peg$c22 = peg$literalExpectation("\\", false),
	        peg$c23 = ".",
	        peg$c24 = peg$literalExpectation(".", false),
	        peg$c25 = function(varId, expr) {
	            return {
	                type: "abstr",
	                vars: [varId],
	                expr: expr
	            };
	        },
	        peg$c26 = "->",
	        peg$c27 = peg$literalExpectation("->", false),
	        peg$c28 = function(vars, expr) {
	            return {
	                type: "abstr",
	                vars: vars,
	                expr: expr
	            };
	        },
	        peg$c29 = function(func, args) {
	            return {
	                type: "appl",
	                func: func,
	                args: args
	            };
	        },
	        peg$c30 = function(op, operant) {
	            return {
	                op: op,
	                operant: operant
	            };
	        },
	        peg$c31 = function(first, operants) {
	            return {
	                type: "operation",
	                first: first,
	                operants: operants
	            };
	        },
	        peg$c32 = function(id) {
	            return { type: "var", id: id};
	        },
	        peg$c33 = function(num) {
	            return {type: "number", number: num};
	        },
	        peg$c34 = peg$otherExpectation("variable"),
	        peg$c35 = /^[_a-zA-Z]/,
	        peg$c36 = peg$classExpectation(["_", ["a", "z"], ["A", "Z"]], false, false),
	        peg$c37 = /^[_a-zA-Z0-9]/,
	        peg$c38 = peg$classExpectation(["_", ["a", "z"], ["A", "Z"], ["0", "9"]], false, false),
	        peg$c39 = function(id) {
	          return id;
	        },
	        peg$c40 = peg$otherExpectation("integer"),
	        peg$c41 = /^[0-9]/,
	        peg$c42 = peg$classExpectation([["0", "9"]], false, false),
	        peg$c43 = function() { return parseInt(text(), 10); },
	        peg$c44 = /^[\-+%\/<>=[\]\^!=&{}*?#$|~]/,
	        peg$c45 = peg$classExpectation(["-", "+", "%", "/", "<", ">", "=", "[", "]", "^", "!", "=", "&", "{", "}", "*", "?", "#", "$", "|", "~"], false, false),
	        peg$c46 = "`",
	        peg$c47 = peg$literalExpectation("`", false),
	        peg$c48 = peg$otherExpectation("whitespace"),
	        peg$c49 = /^[ \t]/,
	        peg$c50 = peg$classExpectation([" ", "\t"], false, false),
	        peg$c51 = /^[\n\r]/,
	        peg$c52 = peg$classExpectation(["\n", "\r"], false, false),
	
	        peg$currPos          = 0,
	        peg$savedPos         = 0,
	        peg$posDetailsCache  = [{ line: 1, column: 1 }],
	        peg$maxFailPos       = 0,
	        peg$maxFailExpected  = [],
	        peg$silentFails      = 0,
	
	        peg$result;
	
	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }
	
	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }
	
	    function text() {
	      return input.substring(peg$savedPos, peg$currPos);
	    }
	
	    function location() {
	      return peg$computeLocation(peg$savedPos, peg$currPos);
	    }
	
	    function expected(description, location) {
	      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
	
	      throw peg$buildStructuredError(
	        [peg$otherExpectation(description)],
	        input.substring(peg$savedPos, peg$currPos),
	        location
	      );
	    }
	
	    function error(message, location) {
	      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
	
	      throw peg$buildSimpleError(message, location);
	    }
	
	    function peg$literalExpectation(text, ignoreCase) {
	      return { type: "literal", text: text, ignoreCase: ignoreCase };
	    }
	
	    function peg$classExpectation(parts, inverted, ignoreCase) {
	      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
	    }
	
	    function peg$anyExpectation() {
	      return { type: "any" };
	    }
	
	    function peg$endExpectation() {
	      return { type: "end" };
	    }
	
	    function peg$otherExpectation(description) {
	      return { type: "other", description: description };
	    }
	
	    function peg$computePosDetails(pos) {
	      var details = peg$posDetailsCache[pos], p;
	
	      if (details) {
	        return details;
	      } else {
	        p = pos - 1;
	        while (!peg$posDetailsCache[p]) {
	          p--;
	        }
	
	        details = peg$posDetailsCache[p];
	        details = {
	          line:   details.line,
	          column: details.column
	        };
	
	        while (p < pos) {
	          if (input.charCodeAt(p) === 10) {
	            details.line++;
	            details.column = 1;
	          } else {
	            details.column++;
	          }
	
	          p++;
	        }
	
	        peg$posDetailsCache[pos] = details;
	        return details;
	      }
	    }
	
	    function peg$computeLocation(startPos, endPos) {
	      var startPosDetails = peg$computePosDetails(startPos),
	          endPosDetails   = peg$computePosDetails(endPos);
	
	      return {
	        start: {
	          offset: startPos,
	          line:   startPosDetails.line,
	          column: startPosDetails.column
	        },
	        end: {
	          offset: endPos,
	          line:   endPosDetails.line,
	          column: endPosDetails.column
	        }
	      };
	    }
	
	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) { return; }
	
	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }
	
	      peg$maxFailExpected.push(expected);
	    }
	
	    function peg$buildSimpleError(message, location) {
	      return new peg$SyntaxError(message, null, null, location);
	    }
	
	    function peg$buildStructuredError(expected, found, location) {
	      return new peg$SyntaxError(
	        peg$SyntaxError.buildMessage(expected, found),
	        expected,
	        found,
	        location
	      );
	    }
	
	    function peg$parseBlock() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = [];
	      if (peg$c0.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c1); }
	      }
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        if (peg$c0.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c1); }
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseEntity();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseEntity();
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c2(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseEntity() {
	      var s0, s1, s2, s3, s4;
	
	      s0 = peg$currPos;
	      s1 = peg$parseDef();
	      if (s1 === peg$FAILED) {
	        s1 = peg$parseExpr();
	        if (s1 === peg$FAILED) {
	          s1 = peg$parseComment();
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse_();
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          if (peg$c3.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c4); }
	          }
	          while (s4 !== peg$FAILED) {
	            s3.push(s4);
	            if (peg$c3.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c4); }
	            }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c5(s1);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseComment() {
	      var s0, s1, s2, s3, s4;
	
	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.substr(peg$currPos, 2) === peg$c6) {
	          s2 = peg$c6;
	          peg$currPos += 2;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c7); }
	        }
	        if (s2 === peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c8) {
	            s2 = peg$c8;
	            peg$currPos += 2;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c9); }
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          if (peg$c10.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c11); }
	          }
	          while (s4 !== peg$FAILED) {
	            s3.push(s4);
	            if (peg$c10.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c11); }
	            }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c12();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDef() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifier();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseIdentifier();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseIdentifier();
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 61) {
	            s3 = peg$c13;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c14); }
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parse_();
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseExpr();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c15(s1, s2, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseAtom() {
	      var s0;
	
	      s0 = peg$parseVar();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseExprP();
	      }
	
	      return s0;
	    }
	
	    function peg$parseExpr() {
	      var s0;
	
	      s0 = peg$parseAbstraction();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseApplication();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseAtom();
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseExprP() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 40) {
	          s2 = peg$c16;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c17); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parseExpr();
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 41) {
	                  s6 = peg$c18;
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
	                }
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c20(s4);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseAbstraction() {
	      var s0;
	
	      s0 = peg$parseAbstraction1();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseAbstraction2();
	      }
	
	      return s0;
	    }
	
	    function peg$parseAbstraction1() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 92) {
	        s1 = peg$c21;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c22); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseIdentifier();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 46) {
	              s4 = peg$c23;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseExpr();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c25(s2, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseAbstraction2() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 92) {
	        s1 = peg$c21;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c22); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseIdentifier();
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseIdentifier();
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 2) === peg$c26) {
	              s4 = peg$c26;
	              peg$currPos += 2;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c27); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseExpr();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c28(s2, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseApplication() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parseFunc();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseAtom();
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseAtom();
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c29(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseFunc() {
	      var s0;
	
	      s0 = peg$parseAbstraction();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseAtom();
	      }
	
	      return s0;
	    }
	
	    function peg$parseOperant() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$parseOperator();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseAtom();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c30(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseOperation() {
	      var s0, s1, s2, s3, s4;
	
	      s0 = peg$currPos;
	      s1 = peg$parseAtom();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse_();
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseOperant();
	          if (s4 !== peg$FAILED) {
	            while (s4 !== peg$FAILED) {
	              s3.push(s4);
	              s4 = peg$parseOperant();
	            }
	          } else {
	            s3 = peg$FAILED;
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c31(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseVar() {
	      var s0, s1;
	
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifier();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c32(s1);
	      }
	      s0 = s1;
	
	      return s0;
	    }
	
	    function peg$parseNumber() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseInteger();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c33(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseIdentifier() {
	      var s0, s1, s2, s3, s4, s5, s6;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$currPos;
	        if (peg$c35.test(input.charAt(peg$currPos))) {
	          s4 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c36); }
	        }
	        if (s4 !== peg$FAILED) {
	          s5 = [];
	          if (peg$c37.test(input.charAt(peg$currPos))) {
	            s6 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s6 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c38); }
	          }
	          while (s6 !== peg$FAILED) {
	            s5.push(s6);
	            if (peg$c37.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c38); }
	            }
	          }
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = input.substring(s2, peg$currPos);
	        } else {
	          s2 = s3;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c39(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c34); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseInteger() {
	      var s0, s1, s2;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = [];
	      if (peg$c41.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c42); }
	      }
	      if (s2 !== peg$FAILED) {
	        while (s2 !== peg$FAILED) {
	          s1.push(s2);
	          if (peg$c41.test(input.charAt(peg$currPos))) {
	            s2 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c42); }
	          }
	        }
	      } else {
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c43();
	      }
	      s0 = s1;
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c40); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseOperator() {
	      var s0, s1, s2, s3, s4;
	
	      s0 = peg$currPos;
	      s1 = [];
	      if (peg$c44.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c45); }
	      }
	      if (s2 !== peg$FAILED) {
	        while (s2 !== peg$FAILED) {
	          s1.push(s2);
	          if (peg$c44.test(input.charAt(peg$currPos))) {
	            s2 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c45); }
	          }
	        }
	      } else {
	        s1 = peg$FAILED;
	      }
	      if (s1 === peg$FAILED) {
	        s1 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 96) {
	          s2 = peg$c46;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c47); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseIdentifier();
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 96) {
	              s4 = peg$c46;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c47); }
	            }
	            if (s4 !== peg$FAILED) {
	              s2 = [s2, s3, s4];
	              s1 = s2;
	            } else {
	              peg$currPos = s1;
	              s1 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s1;
	            s1 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        s0 = input.substring(s0, peg$currPos);
	      } else {
	        s0 = s1;
	      }
	
	      return s0;
	    }
	
	    function peg$parse_() {
	      var s0, s1, s2, s3;
	
	      peg$silentFails++;
	      s0 = [];
	      if (peg$c49.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c50); }
	      }
	      if (s1 === peg$FAILED) {
	        s1 = peg$currPos;
	        s2 = [];
	        if (peg$c51.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c52); }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c51.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c52); }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          if (peg$c49.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c50); }
	          }
	          if (s3 !== peg$FAILED) {
	            s2 = [s2, s3];
	            s1 = s2;
	          } else {
	            peg$currPos = s1;
	            s1 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (peg$c49.test(input.charAt(peg$currPos))) {
	          s1 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c50); }
	        }
	        if (s1 === peg$FAILED) {
	          s1 = peg$currPos;
	          s2 = [];
	          if (peg$c51.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c52); }
	          }
	          if (s3 !== peg$FAILED) {
	            while (s3 !== peg$FAILED) {
	              s2.push(s3);
	              if (peg$c51.test(input.charAt(peg$currPos))) {
	                s3 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s3 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c52); }
	              }
	            }
	          } else {
	            s2 = peg$FAILED;
	          }
	          if (s2 !== peg$FAILED) {
	            if (peg$c49.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c50); }
	            }
	            if (s3 !== peg$FAILED) {
	              s2 = [s2, s3];
	              s1 = s2;
	            } else {
	              peg$currPos = s1;
	              s1 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s1;
	            s1 = peg$FAILED;
	          }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c48); }
	      }
	
	      return s0;
	    }
	
	    peg$result = peg$startRuleFunction();
	
	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail(peg$endExpectation());
	      }
	
	      throw peg$buildStructuredError(
	        peg$maxFailExpected,
	        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
	        peg$maxFailPos < input.length
	          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
	          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
	      );
	    }
	  }
	
	  return {
	    SyntaxError: peg$SyntaxError,
	    parse:       peg$parse
	  };
	})();

/***/ },

/***/ 183:
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

/***/ 184:
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

/***/ 185:
/***/ function(module, exports) {

	"use strict";
	const defaultRandomStrings = "abcdefghijklmnopqrstuvwxyz0123456789";
	function randomString(length = 8, chars = defaultRandomStrings) {
	    var result = "";
	    for (var i = length; i > 0; --i) {
	        result += chars[Math.floor(Math.random() * chars.length)];
	    }
	    return result;
	}
	exports.randomString = randomString;
	function normFloat(num) {
	    return parseFloat((Math.round(num * 100) / 100).toFixed(2));
	}
	exports.normFloat = normFloat;


/***/ },

/***/ 186:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const React = __webpack_require__(1);
	const Utils = __webpack_require__(185);
	/** small wrapper for bootstrap form groups */
	class FormGroup extends React.Component {
	    render() {
	        return (React.createElement("div", {className: "form-group"}, 
	            React.createElement("label", {htmlFor: this.props.id, className: "col-sm-6 control-label"}, this.props.label), 
	            React.createElement("div", {className: "col-sm-6 " + (this.props.isStatic ? "form-control-static" : "")}, this.props.children)));
	    }
	}
	exports.FormGroup = FormGroup;
	/** small wrapper for bootstrap form checkboxes */
	class CheckboxForm extends React.Component {
	    constructor() {
	        super(...arguments);
	        this.id = this.props.id || Utils.randomString();
	    }
	    onChange() {
	        this.props.onChange(this.input.checked);
	    }
	    render() {
	        return (React.createElement(FormGroup, {label: this.props.label, id: this.props.id, isStatic: true}, 
	            React.createElement("input", {type: "checkbox", checked: this.props.checked, id: this.id, ref: e => this.input = e, onChange: this.onChange.bind(this)})
	        ));
	    }
	}
	exports.CheckboxForm = CheckboxForm;
	/** small wrapper for bootstrap form number field */
	class NumberForm extends React.Component {
	    constructor() {
	        super(...arguments);
	        this.id = this.props.id || Utils.randomString();
	    }
	    onChange() {
	        this.props.onChange(+this.input.value);
	    }
	    render() {
	        return (React.createElement(FormGroup, {label: this.props.label, id: this.props.id, isStatic: true}, 
	            React.createElement("input", {type: "number", value: this.props.value, id: this.id, step: this.props.step, min: this.props.min, max: this.props.max, ref: e => this.input = e, onChange: this.onChange.bind(this)})
	        ));
	    }
	}
	exports.NumberForm = NumberForm;
	class Switch extends React.Component {
	    constructor() {
	        super(...arguments);
	        this.id = this.props.id || Utils.randomString();
	    }
	    onChange() {
	        this.props.onChange(this.input.checked);
	    }
	    render() {
	        return (React.createElement("div", {className: "switch-grouper"}, 
	            React.createElement("label", {htmlFor: this.id}, this.props.label), 
	            React.createElement("label", {className: "switch"}, 
	                React.createElement("input", {type: "checkbox", checked: this.props.checked, id: this.id, ref: e => this.input = e, onChange: this.onChange.bind(this)}), 
	                React.createElement("div", {className: "slider"}))));
	    }
	}
	exports.Switch = Switch;


/***/ },

/***/ 204:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(205);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(203)(content, {});
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

/***/ 205:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(197)();
	// imports
	
	
	// module
	exports.push([module.id, "body {\n    background-color: whitesmoke;\n    padding-bottom: 500px;\n}\n\n.inputArea {\n    width: auto;\n    background-color: whitesmoke;\n    border: solid 1px darkgray;\n    padding: 2px;\n}\n\n.transition-prob-control input {\n    margin: 4px;\n    width: 80px;\n    text-align: center;\n}\n\n.input-block {\n    font: 15px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;\n    margin-bottom: 30px;\n}\n\n.input-block:last-child {\n    margin-bottom: 0px;\n}\n\n.ace-container {\n    border: solid 1px lightgray;\n}\n\n.error-box {\n    color: darkred;\n    border: solid 1px lightgray;\n    padding: 3px;\n}\n\n.config-box {\n    color: dimgrey;\n    border: solid 1px lightgray;\n    padding: 5px;\n    vertical-align: center;\n    background-color: #f0f0f0;\n}\n\n.config-box label {\n    margin: 0 4px;\n}\n\n.expr-box {\n    color: black;\n    border: solid 1px lightgray;\n    padding: 3px;\n    padding-left: 10px;\n    overflow: auto;\n    word-wrap: normal;\n    white-space:nowrap;\n}\n\n.appl-box {\n    padding: 1px;\n}\n\n.reduce-box {\n    text-align: right;\n    background: #d0ffd0;\n    float: right;\n}\n\n\n\n\n\n\n\n\n.switch-grouper {\n    vertical-align: middle;\n}\n\n.switch {\n  position: relative;\n  display: inline-block;\n  width: 30px;\n  height: 17px;\n  margin: 0 4px;\n  vertical-align: middle;\n}\n\n/* Hide default HTML checkbox */\n.switch input {display:none;}\n\n/* The slider */\n.slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  -webkit-transition: .4s;\n  transition: .4s;\n}\n\n.slider:before {\n  position: absolute;\n  content: \"\";\n  height: 13px;\n  width: 13px;\n  left: 2px;\n  bottom: 2px;\n  background-color: white;\n  -webkit-transition: .4s;\n  transition: .4s;\n}\n\ninput:checked + .slider {\n  background-color: #2196F3;\n}\n\ninput:focus + .slider {\n  box-shadow: 0 0 1px #2196F3;\n}\n\ninput:checked + .slider:before {\n  -webkit-transform: translateX(13px);\n  -ms-transform: translateX(13px);\n  transform: translateX(13px);\n}", ""]);
	
	// exports


/***/ }

});
//# sourceMappingURL=main-60e765799ae498c12835.js.map