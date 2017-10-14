webpackJsonp([1],{

/***/ 190:
/***/ (function(module, exports, __webpack_require__) {

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
var React = __webpack_require__(24);
var block_1 = __webpack_require__(191);
var textPrinter_1 = __webpack_require__(194);
var ev = __webpack_require__(195);
var utils = __webpack_require__(84);
var Visual = __webpack_require__(196);
var react_monaco_editor_1 = __webpack_require__(197);
var lambdaEditorSyntax_1 = __webpack_require__(200);
function toStrategy(strategy) {
    console.log(strategy);
    switch (strategy) {
        case "normal": return ev.strategy.normal;
        case "value": return ev.strategy.callByValue;
        case "name": return ev.strategy.callByName;
    }
    throw "unknown strategy";
}
var InputBlock = /** @class */ (function (_super) {
    __extends(InputBlock, _super);
    function InputBlock(props) {
        var _this = _super.call(this, props) || this;
        _this.id = utils.randomString(12);
        _this.reducers = [];
        _this.block = new block_1.Block(_this.props.factory, _this.props.parent, function () { _this.startReducing(); });
        _this.block.setCode(_this.props.value || "");
        _this.state = {
            evals: [],
            strategy: ev.strategy.normal,
            attemptsToCompileZeroExpressions: 0,
            showAllAppl: false,
            transformAliases: true
        };
        window.addEventListener('resize', function () { return _this.editor.layout(); });
        return _this;
    }
    InputBlock.prototype.stopReducing = function () {
        this.reducers.forEach(function (r) { return r.stop(); });
        this.reducers = [];
        this.setState({ evaluating: false });
    };
    InputBlock.prototype.startReducing = function () {
        var _this = this;
        var exprs = this.block.expressions();
        console.log("attempts: ", this.state.attemptsToCompileZeroExpressions);
        if (exprs.length) {
            this.setState({ attemptsToCompileZeroExpressions: 0 });
            this.stopReducing();
            this.setState({ evaluating: true });
            var strategy_1 = this.state.strategy;
            this.reducers = exprs.map(function (expr) { return new ev.Reducer(expr, strategy_1, _this.props.factory); });
            this.doReducing(0, []);
        }
        else {
            this.endReducing([]);
            this.setState({ attemptsToCompileZeroExpressions: this.state.attemptsToCompileZeroExpressions + 1 });
        }
    };
    InputBlock.prototype.endReducing = function (evals) {
        console.log(evals.length);
        this.stopReducing();
        this.setState({
            evals: evals
        });
    };
    InputBlock.prototype.doReducing = function (i, evals) {
        var _this = this;
        if (i < this.reducers.length) {
            this.reducers[i].run(function (steps, reduced) {
                var zip = steps.map(function (s, i) { return [s, reduced[i]]; });
                evals.push(zip);
                _this.doReducing(i + 1, evals);
            }, function () {
                _this.endReducing(evals);
            });
        }
        else {
            this.endReducing(evals);
        }
    };
    InputBlock.prototype.commitCodeToBlock = function () {
        var code = this.block.getCode();
        console.log(code);
        this.setState({ error: undefined, evaluating: true });
        //this.editor.getSession().setAnnotations([]);
        try {
            this.block.setCodeAndCompile(code);
            return true;
        }
        catch (e) {
            var err = e;
            var message = err.message, location_1 = err.location;
            var _a = location_1.start, line = _a.line, column = _a.column;
            this.setError(message + " in line " + line + ", column " + column);
            /*this.editor.getSession().setAnnotations([{
                row: err.location.start.line-1,
                column: err.location.start.column,
                text: err.message,
                type: "error" // also warning and information
            }]);*/
            this.stopReducing();
            return false;
        }
    };
    InputBlock.prototype.setError = function (msg) {
        this.setState({ error: msg });
    };
    InputBlock.prototype.onSubmit = function () {
        this.setState({ attemptsToCompileZeroExpressions: 0 });
        // compile, start reducing and add new block
        if (this.commitCodeToBlock()) {
            this.props.onFinish(this.props.index, this.block);
        }
    };
    InputBlock.prototype.onExecute = function () {
        // compile and start reducing
        this.commitCodeToBlock();
    };
    InputBlock.prototype.editorDidMount = function (editor) {
        var _this = this;
        editor.focus();
        editor.addAction({
            label: "Execute Block",
            id: "execute",
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],
            run: function () { return _this.onExecute(); }
        });
        editor.addAction({
            label: "Submit Block",
            id: "submit",
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyCode.Enter
            ],
            run: function () { return _this.onSubmit(); }
        });
        this.editor = editor;
    };
    InputBlock.prototype.editorWillMount = function () {
        console.log("register lang");
        monaco.languages.register({
            id: "lambda"
        });
        monaco.languages.setMonarchTokensProvider("lambda", lambdaEditorSyntax_1.syntax);
    };
    InputBlock.prototype.render = function () {
        var _this = this;
        var evals = this.state.evals || [];
        var showAllAppl = this.state.showAllAppl;
        var transformAliases = this.state.transformAliases;
        var options = {
            automaticLayout: true,
            scrollbar: {
                useShadows: false
            },
            fontFamily: "monaco"
        };
        return (React.createElement("div", { className: "input-block" },
            React.createElement("div", { className: "editor-container" },
                React.createElement(react_monaco_editor_1.default, { height: 400, width: "100%", language: "lambda", value: this.block.getCode(), onChange: function (code) { return _this.block.setCode(code); }, editorDidMount: function (e) { return _this.editorDidMount(e); }, editorWillMount: function (e) { return _this.editorWillMount(); } })),
            React.createElement("div", { className: "config-box" },
                React.createElement("div", { className: "config-group left" },
                    React.createElement(Visual.Switch, { className: "showAll-switch", checked: showAllAppl, onChange: function (b) { _this.setState({ showAllAppl: b }); }, label: "Show all steps" }),
                    React.createElement(Visual.Switch, { className: "transformAliases-switch", checked: transformAliases, onChange: function (b) { _this.setState({ transformAliases: b }); }, label: "Transform Aliases" })),
                React.createElement("div", { className: "config-group right" },
                    React.createElement("span", { className: "expression-count-box" + (this.state.attemptsToCompileZeroExpressions > 1 ? " too-many-zero-expression-attempts" : "") }, evals.length == 0 ? "No expressions" : ''),
                    React.createElement("select", { className: "strategy-select", ref: function (s) { return _this.strategySelect = s; }, onChange: function (sel) { return _this.setState({ strategy: toStrategy(sel.target.value) }); } },
                        React.createElement("option", { value: "normal" }, "Normal"),
                        React.createElement("option", { value: "name" }, "Call-By-Name"),
                        React.createElement("option", { value: "value" }, "Call-By-Value")),
                    React.createElement(Visual.ToggleButton, { className: "run-button", checked: !!this.state.evaluating, label: this.state.evaluating ? "Stop \u25FE" : "Run \u25B6", onChange: function (b) { if (b) {
                            _this.onExecute();
                        }
                        else
                            _this.stopReducing(); } })),
                React.createElement("div", { className: "float-clear" })),
            this.state.error ?
                React.createElement("div", { className: "error-box" },
                    "Error: ",
                    this.state.error)
                :
                    React.createElement("div", { className: "output-box" }, evals.map(function (lmbs) {
                        function underline_appl(f, a) {
                            return [
                                "<u class=\"redex-func\">" + f + "</u>",
                                "<u class=\"redex-arg\">" + a + "</u>"
                            ];
                        }
                        function print_lmb(_a, idx) {
                            var lmb = _a[0], app = _a[1];
                            var ops = {};
                            if (app) {
                                ops.appl_pp = new Map([[app, underline_appl]]);
                            }
                            var result = [(idx == 0 ? "" : "=> ") + textPrinter_1.to_string(lmb, ops)];
                            if (app && showAllAppl && transformAliases) {
                                var f = app.func();
                                if (f.alias()) {
                                    ops.force_expand_aliases = new Set([f]);
                                    result.push("&nbsp;= " + textPrinter_1.to_string(lmb, ops));
                                }
                            }
                            return result;
                        }
                        return (React.createElement("div", { className: "expr-box" },
                            lmbs
                                .filter(function (_, idx) { return showAllAppl || idx == 0 || idx == lmbs.length - 1; })
                                .map(print_lmb)
                                .map(function (ss) { return ss.map(function (s, i) { return React.createElement("div", { className: "appl-box" + (i ? " aliasTransform" : ""), dangerouslySetInnerHTML: { __html: s } }); }); }),
                            React.createElement("div", { className: "reduce-box" },
                                lmbs.length - 1,
                                " Steps")));
                    }))));
    };
    return InputBlock;
}(React.Component));
var InputPanel = /** @class */ (function (_super) {
    __extends(InputPanel, _super);
    function InputPanel(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { blocks: [] };
        _this.addInputBlock(undefined);
        return _this;
    }
    InputPanel.prototype.addInputBlock = function (block) {
        var _this = this;
        var idx = this.state.blocks.length;
        var newB = (React.createElement(InputBlock, { factory: this.props.factory, index: idx, parent: block, onFinish: function (from, blk) {
                if (from + 1 >= _this.state.blocks.length) {
                    _this.addInputBlock(blk);
                }
            } }));
        this.state.blocks.push(newB);
        this.setState({ blocks: this.state.blocks });
    };
    InputPanel.prototype.render = function () {
        return (React.createElement("div", { className: "panel panel-default config-panel" },
            React.createElement("div", { className: "panel-heading" },
                React.createElement("h3", { className: "panel-title" },
                    React.createElement("a", { "data-toggle": "collapse", "data-target": "#main-panel" }, "Lambda Evaluator"))),
            React.createElement("div", { className: "panel-body collapse in", id: "main-panel" }, this.state.blocks)));
    };
    return InputPanel;
}(React.Component));
exports.InputPanel = InputPanel;


/***/ }),

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

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
var lambda_1 = __webpack_require__(33);
var parse_1 = __webpack_require__(192);
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
    };
    Block.prototype.getCode = function () {
        return this.code;
    };
    Block.prototype.setCodeAndCompile = function (code) {
        this.setCode(code);
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


/***/ }),

/***/ 192:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var grammar = __webpack_require__(193);
function parse(code, factory) {
    function makeParameter(body, params) {
        for (var _i = 0, _a = params.reverse(); _i < _a.length; _i++) {
            var param = _a[_i];
            body = factory.newAbstraction(param, body);
        }
        return body;
    }
    function convert(node) {
        switch (node.type) {
            case "def":
                {
                    var n = node;
                    return factory.newGlobalDefiniton(n.name, makeParameter(convert(n.def), n.params));
                }
            case "abstr":
                {
                    var n = node;
                    return makeParameter(convert(n.expr), n.vars);
                }
            case "appl":
                {
                    var n = node;
                    var func = convert(n.func);
                    for (var _i = 0, _a = n.args; _i < _a.length; _i++) {
                        var arg = _a[_i];
                        func = factory.newApplication(func, convert(arg));
                    }
                    return func;
                }
            case "var":
                {
                    var n = node;
                    return factory.newVariable(n.id);
                }
        }
        throw "internal error: unknown node type " + node.type;
    }
    var root = grammar.parse(code);
    return root.entities.map(convert);
}
exports.parse = parse;


/***/ }),

/***/ 193:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */



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
      peg$c10 = "#",
      peg$c11 = peg$literalExpectation("#", false),
      peg$c12 = /^[^\n\r]/,
      peg$c13 = peg$classExpectation(["\n", "\r"], true, false),
      peg$c14 = function() {
          return undefined;
      },
      peg$c15 = "=",
      peg$c16 = peg$literalExpectation("=", false),
      peg$c17 = function(name, params, def) {
          return {
              type: "def",
              name: name,
              params: params,
              def: def
          };
      },
      peg$c18 = "(",
      peg$c19 = peg$literalExpectation("(", false),
      peg$c20 = ")",
      peg$c21 = peg$literalExpectation(")", false),
      peg$c22 = function(exp) {
          return exp;
      },
      peg$c23 = "\\",
      peg$c24 = peg$literalExpectation("\\", false),
      peg$c25 = ".",
      peg$c26 = peg$literalExpectation(".", false),
      peg$c27 = function(varId, expr) {
          return {
              type: "abstr",
              vars: [varId],
              expr: expr
          };
      },
      peg$c28 = "->",
      peg$c29 = peg$literalExpectation("->", false),
      peg$c30 = function(vars, expr) {
          return {
              type: "abstr",
              vars: vars,
              expr: expr
          };
      },
      peg$c31 = function(func, args) {
          return {
              type: "appl",
              func: func,
              args: args
          };
      },
      peg$c32 = function(op, operant) {
          return {
              op: op,
              operant: operant
          };
      },
      peg$c33 = function(first, operants) {
          return {
              type: "operation",
              first: first,
              operants: operants
          };
      },
      peg$c34 = function(id) {
          return { type: "var", id: id};
      },
      peg$c35 = function(num) {
          return {type: "number", number: num};
      },
      peg$c36 = peg$otherExpectation("variable"),
      peg$c37 = /^[_a-zA-Z]/,
      peg$c38 = peg$classExpectation(["_", ["a", "z"], ["A", "Z"]], false, false),
      peg$c39 = /^[_a-zA-Z0-9]/,
      peg$c40 = peg$classExpectation(["_", ["a", "z"], ["A", "Z"], ["0", "9"]], false, false),
      peg$c41 = function(id) {
        return id;
      },
      peg$c42 = peg$otherExpectation("integer"),
      peg$c43 = /^[0-9]/,
      peg$c44 = peg$classExpectation([["0", "9"]], false, false),
      peg$c45 = function() { return parseInt(text(), 10); },
      peg$c46 = /^[\-+%\/<>=[\]\^!=&{}*?#$|~]/,
      peg$c47 = peg$classExpectation(["-", "+", "%", "/", "<", ">", "=", "[", "]", "^", "!", "=", "&", "{", "}", "*", "?", "#", "$", "|", "~"], false, false),
      peg$c48 = "`",
      peg$c49 = peg$literalExpectation("`", false),
      peg$c50 = peg$otherExpectation("whitespace"),
      peg$c51 = /^[ \t]/,
      peg$c52 = peg$classExpectation([" ", "\t"], false, false),
      peg$c53 = /^[\n\r]/,
      peg$c54 = peg$classExpectation(["\n", "\r"], false, false),

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
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 35) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c12.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c13); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c12.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c14();
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
          s3 = peg$c15;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c16); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseExpr();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c17(s1, s2, s5);
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
        s2 = peg$c18;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseExpr();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c20;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c21); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c22(s4);
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
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c23;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseIdentifier();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s4 = peg$c25;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c26); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseExpr();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c27(s3, s5);
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
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c23;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseIdentifier();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseIdentifier();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c28) {
            s4 = peg$c28;
            peg$currPos += 2;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c29); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseExpr();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c30(s3, s5);
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
        s1 = peg$c31(s1, s2);
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
        s1 = peg$c32(s1, s2);
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
          s1 = peg$c33(s1, s3);
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
      s1 = peg$c34(s1);
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
          s1 = peg$c35(s2);
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
      if (peg$c37.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }
      if (s4 !== peg$FAILED) {
        s5 = [];
        if (peg$c39.test(input.charAt(peg$currPos))) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c40); }
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          if (peg$c39.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
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
          s1 = peg$c41(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c36); }
    }

    return s0;
  }

  function peg$parseInteger() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$c43.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c44); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c43.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c44); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c45();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c42); }
    }

    return s0;
  }

  function peg$parseOperator() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c46.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c47); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c46.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c47); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 96) {
        s2 = peg$c48;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseIdentifier();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 96) {
            s4 = peg$c48;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
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
    if (peg$c51.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c52); }
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = [];
      if (peg$c53.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c53.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (peg$c51.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
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
      if (peg$c51.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = [];
        if (peg$c53.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c53.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c54); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (peg$c51.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c52); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c50); }
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

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};


/***/ }),

/***/ 194:
/***/ (function(module, exports, __webpack_require__) {

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
var lambda_1 = __webpack_require__(33);
function to_string(l, opts) {
    if (opts === void 0) { opts = {}; }
    if (opts.print_id) {
        opts.print_paren = true;
    }
    opts.appl_pp = opts.appl_pp || new Map();
    opts.force_expand_aliases = opts.force_expand_aliases || new Set();
    var boundNames = [];
    return tos(l, false, false);
    function tos(lmb, inAppl, firstInAppl) {
        var ToStringVisitor = /** @class */ (function (_super) {
            __extends(ToStringVisitor, _super);
            function ToStringVisitor() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ToStringVisitor.prototype.visit_appl = function (node) {
                var f = tos(node.func(), true, true);
                var a = tos(node.arg(), true, false);
                var pp = opts.appl_pp.get(node) || (function (a, b) { return [a, b]; });
                _a = pp(f, a), f = _a[0], a = _a[1];
                return this.p(f + " " + a, { paren: inAppl && !firstInAppl });
                var _a;
            };
            ToStringVisitor.prototype.visit_abst = function (node) {
                var name = node.name();
                boundNames.push(name);
                var body = tos(node.body(), false, false);
                boundNames.pop();
                return this.p("\\" + name + "." + body, { paren: inAppl });
            };
            ToStringVisitor.prototype.visit_var = function (node) {
                var str = this.p(node.name(), { def: node.def() });
                if (!node.isBound()) {
                    str = prependIfBound("$", str);
                }
                return str;
            };
            ToStringVisitor.prototype.visit_gdef = function (node) {
                var name = node.name();
                var def = tos(node.def(), false, false);
                return this.p(name + " = " + def);
            };
            ToStringVisitor.prototype.appedix = function (info) {
                var result = [];
                if (opts.print_id) {
                    result.push("id=" + lmb.id());
                }
                if (opts.print_def && info.def) {
                    result.push("def=" + info.def.id());
                }
                return result.length ? "[" + result.join(",") + "]" : "";
            };
            ToStringVisitor.prototype.p = function (str, info) {
                if (info === void 0) { info = {}; }
                return (opts.print_paren || info.paren ? "(" + str + ")" : str) + this.appedix(info);
            };
            return ToStringVisitor;
        }(lambda_1.LambdaVisitor));
        function prependIfBound(c, name) {
            if (boundNames.indexOf(name) >= 0) {
                name = c + name;
            }
            return name;
        }
        var alias = lmb.alias();
        if (alias && !opts.expand_alias && !opts.force_expand_aliases.has(lmb)) {
            return prependIfBound("@", alias.name());
        }
        var v = new ToStringVisitor();
        return v.do_visit(lmb);
    }
}
exports.to_string = to_string;


/***/ }),

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {

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
var lambda_1 = __webpack_require__(33);
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


/***/ }),

/***/ 196:
/***/ (function(module, exports, __webpack_require__) {

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
var React = __webpack_require__(24);
var Utils = __webpack_require__(84);
/** small wrapper for bootstrap form groups */
var FormGroup = /** @class */ (function (_super) {
    __extends(FormGroup, _super);
    function FormGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormGroup.prototype.render = function () {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { htmlFor: this.props.id, className: "col-sm-6 control-label" }, this.props.label),
            React.createElement("div", { className: "col-sm-6 " + (this.props.isStatic ? "form-control-static" : "") }, this.props.children)));
    };
    return FormGroup;
}(React.Component));
exports.FormGroup = FormGroup;
/** small wrapper for bootstrap form checkboxes */
var CheckboxForm = /** @class */ (function (_super) {
    __extends(CheckboxForm, _super);
    function CheckboxForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    CheckboxForm.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    CheckboxForm.prototype.render = function () {
        var _this = this;
        return (React.createElement(FormGroup, { label: this.props.label, id: this.props.id, isStatic: true },
            React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) })));
    };
    return CheckboxForm;
}(React.Component));
exports.CheckboxForm = CheckboxForm;
/** small wrapper for bootstrap form number field */
var NumberForm = /** @class */ (function (_super) {
    __extends(NumberForm, _super);
    function NumberForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    NumberForm.prototype.onChange = function () {
        this.props.onChange(+this.input.value);
    };
    NumberForm.prototype.render = function () {
        var _this = this;
        return (React.createElement(FormGroup, { label: this.props.label, id: this.props.id, isStatic: true },
            React.createElement("input", { type: "number", value: this.props.value, id: this.id, step: this.props.step, min: this.props.min, max: this.props.max, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) })));
    };
    return NumberForm;
}(React.Component));
exports.NumberForm = NumberForm;
var Switch = /** @class */ (function (_super) {
    __extends(Switch, _super);
    function Switch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    Switch.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    Switch.prototype.render = function () {
        var _this = this;
        return (React.createElement("span", { className: "switch-grouper " + (this.props.className || "") },
            React.createElement("label", { htmlFor: this.id }, this.props.label),
            React.createElement("label", { className: "switch" },
                React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) }),
                React.createElement("div", { className: "slider" }))));
    };
    return Switch;
}(React.Component));
exports.Switch = Switch;
var ToggleButton = /** @class */ (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    ToggleButton.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    ToggleButton.prototype.render = function () {
        var _this = this;
        return (React.createElement("label", { className: "toggle " + (this.props.className || "") },
            React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) }),
            React.createElement("div", { className: "toggle-view" }, this.props.label)));
    };
    return ToggleButton;
}(React.Component));
exports.ToggleButton = ToggleButton;


/***/ }),

/***/ 200:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.syntax = {
    keywords: [],
    typeKeywords: [],
    operators: [
        '=', '->', '.', '\\'
    ],
    // The main tokenizer for our languages
    tokenizer: {
        root: [
            [/\\/, "keyword", "@insig"],
            [/^[^a-zA-Z_0-9]*[a-zA-Z_0-9]+(?=.*=)/, "keyword", "@insig"],
            // whitespace
            { include: '@whitespace' },
        ],
        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\/.*$/, 'comment'],
            [/#.*$/, 'comment'],
            [/--.*$/, 'comment'],
        ],
        insig: [
            [/[a-zA-Z_0-9]+/, "string"],
            [/->|[\.=]/, "keyword", "@pop"]
        ]
    },
};


/***/ }),

/***/ 209:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(210);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(88)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 210:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(86)(undefined);
// imports


// module
exports.push([module.i, "body {\n    background-color: whitesmoke;\n    padding-bottom: 200px;\n}\n\n.input-block {\n    font: 15px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;\n    margin-bottom: 30px;\n}\n\n.input-block:last-child {\n    margin-bottom: 0px;\n}\n\n.editor-container {\n    border: solid 1px lightgray;\n}\n\n.error-box {\n    color: darkred;\n    border: solid 1px lightgray;\n    padding: 3px;\n}\n\n.expression-count-box {\n    margin-right: 5px\n}\n\n.too-many-zero-expression-attempts {\n    color: darkred;\n    font-weight: bold;\n}\n\n.config-box {\n    color: dimgrey;\n    border: solid 1px lightgray;\n    padding: 5px;\n    vertical-align: center;\n    background-color: #f0f0f0;\n}\n\n.config-box label {\n    margin: 0 4px;\n}\n\n.config-box > * {\n    height: 30px;\n}\n\n.expr-box {\n    color: black;\n    border: solid 1px lightgray;\n    padding: 3px;\n    padding-left: 10px;\n    overflow: auto;\n    word-wrap: normal;\n    white-space:nowrap;\n}\n\n.appl-box {\n    padding: 1px;\n}\n\n.appl-box.aliasTransform {\n    color: #666666\n}\n\nu.redex-func {\n    border-bottom: 1px solid;\n    text-decoration: none;\n}\n\nu.redex-arg {\n    border-bottom: 1px dashed;\n    text-decoration: none;\n}\n\n.reduce-box {\n    text-align: right;\n    background: #d0ffd0;\n    float: right;\n}\n\n.config-group {\n    display: flex;\n    align-items: center\n}\n\n.left { float: left; }\n.right { float: right; }\n\n.run-button > .toggle-view {\n    color: white;\n    background: green;\n    width: 50pt;\n    margin-left: 5px;\n    text-align: center;\n}\n\n.run-button > input:checked + .toggle-view {\n    background: darkred;\n}\n\n.float-clear {\n    clear: both;\n    height: 0\n}\n\n\n\n\n.switch {\n    vertical-align: middle;\n}\n\n.switch {\n  position: relative;\n  display: inline-block;\n  width: 30px;\n  height: 17px;\n  margin: 0 4px;\n  vertical-align: middle;\n}\n\n/* Hide default HTML checkbox */\n.switch input {display:none;}\n\n/* The slider */\n.slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  -webkit-transition: .1s;\n  transition: .1s;\n}\n\n.slider:before {\n  position: absolute;\n  content: \"\";\n  height: 13px;\n  width: 13px;\n  left: 2px;\n  bottom: 2px;\n  background-color: white;\n  -webkit-transition: .1s;\n  transition: .1s;\n}\n\n\n\ninput:checked + .slider {\n  background-color: #2196F3;\n}\n\ninput:focus + .slider {\n  box-shadow: 0 0 1px #2196F3;\n}\n\ninput:checked + .slider:before {\n  -webkit-transform: translateX(13px);\n  -ms-transform: translateX(13px);\n  transform: translateX(13px);\n}\n\n\n\n\n\n.toggle {\n    vertical-align: middle;\n}\n\n.toggle {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n}\n\n/* Hide default HTML checkbox */\n.toggle input {display:none;}\n\n/* The slider */\n.toggle-view {\n  cursor: pointer;\n  background-color: #ccc;\n  -webkit-transition: .4s;\n  transition: .4s;\n  padding: 2px 5px;\n}\n\n.toggle-view:before {\n  background-color: white;\n  -webkit-transition: .4s;\n  transition: .4s;\n}\n\ninput:checked + .toggle-view {\n  background-color: #2196F3;\n}\n\ninput:focus + .toggle-view {\n  box-shadow: 0 0 1px #2196F3;\n}\n\n.monaco-editor .margin {\n    background-color: #f0f0f0 !important\n}\n\n", ""]);

// exports


/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),

/***/ 84:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var defaultRandomStrings = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomString(length, chars) {
    if (length === void 0) { length = 8; }
    if (chars === void 0) { chars = defaultRandomStrings; }
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


/***/ }),

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {

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
var React = __webpack_require__(24);
var ReactDOM = __webpack_require__(104);
var inputPanel_1 = __webpack_require__(190);
var lambda_1 = __webpack_require__(33);
__webpack_require__(85);
__webpack_require__(201);
__webpack_require__(202);
__webpack_require__(209);
var GUI = /** @class */ (function (_super) {
    __extends(GUI, _super);
    function GUI() {
        var _this = _super.call(this) || this;
        _this.factory = new lambda_1.LambdaFactory();
        _this.state = { text: "Test" };
        return _this;
    }
    GUI.prototype.settingsChanged = function () {
    };
    GUI.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("a", { href: "https://github.com/srtobi/lambda" },
                React.createElement("img", { style: { position: "absolute", top: 0, right: 0, border: 0 }, src: "https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67", alt: "Fork me on GitHub", "data-canonical-src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" })),
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "page-header" },
                    React.createElement("h1", null,
                        "Lambda ",
                        React.createElement("small", null,
                            "by ",
                            React.createElement("a", { href: "https://github.com/SrTobi/" }, "SrTobi")))),
                React.createElement(inputPanel_1.InputPanel, { factory: this.factory }),
                React.createElement("div", { className: "panel panel-default config-panel" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("h3", { className: "panel-title" },
                            React.createElement("a", { "data-toggle": "collapse", "data-target": "#manual-panel" }, "Manual"))),
                    React.createElement("div", { className: "panel-body collapse", id: "manual-panel" },
                        React.createElement("p", null,
                            "This tool lets you evaluate lambda expressions. Just enter your code into the code box above and click ",
                            React.createElement("b", null, "Run"),
                            " or press ",
                            React.createElement("i", null,
                                React.createElement("code", null, "Strg+Enter"),
                                "."),
                            "You may also create a new code box: just press ",
                            React.createElement("i", null,
                                React.createElement("code", null, "Shift+Enter")),
                            "."),
                        React.createElement("h4", null, "Lambda"),
                        React.createElement("p", null, "Lambda expressions can be written in the usual way."),
                        React.createElement("pre", null, "(\\arg.arg var) (\\i.i)"),
                        React.createElement("p", null, "In the box below the code you can now see how your expression is evaluated. The underlines will indicate the redix that is currentliy evaluated."),
                        React.createElement("pre", null,
                            "(\\arg.arg var) (\\i.i)",
                            React.createElement("br", null),
                            "=> (\\i.i) var",
                            React.createElement("br", null),
                            "=> var"),
                        React.createElement("p", null,
                            "You may also define aliases for lambda expressions. Just assign them to a name using ",
                            React.createElement("code", null, "[alias] = [lambda]"),
                            ". The alias will then act as if it were the assigned expression. Remember that you ",
                            React.createElement("b", null, "can not"),
                            " use the alias in the expression itself!"),
                        React.createElement("pre", null,
                            "id = (\\i.i)",
                            React.createElement("br", null),
                            "(\\arg.arg var) id"),
                        React.createElement("p", null,
                            "If you have ",
                            React.createElement("code", null, "Transform Aliases"),
                            " activated an alias will be transformed to its definition befor it gets evaluated."),
                        React.createElement("pre", null,
                            "(\\arg.arg var) id",
                            React.createElement("br", null),
                            "=> id var",
                            React.createElement("br", null),
                            "\u00A0= (\\i.i) var",
                            React.createElement("br", null),
                            "=> var"),
                        React.createElement("h4", null, "Syntactic sugar"),
                        React.createElement("p", { style: { color: "red" } },
                            React.createElement("b", null, "Do not"),
                            " use the following syntax in your exam!"),
                        React.createElement("p", null, "To make things easier there are two shortcuts regarding arguments:"),
                        React.createElement("pre", null,
                            "// the following lines are equivalent",
                            React.createElement("br", null),
                            "func a b = expr",
                            React.createElement("br", null),
                            "func = \\a.\\b.expr",
                            React.createElement("br", null),
                            React.createElement("br", null)
                        // the following lines are equivalent<br />
                        ,
                            "// the following lines are equivalent",
                            React.createElement("br", null),
                            "\\a b -> expr",
                            React.createElement("br", null),
                            "\\a.\\b.expr",
                            React.createElement("br", null)))))));
    };
    return GUI;
}(React.Component));
var target = document.createElement("div");
ReactDOM.render(React.createElement(GUI, null), target);
document.body.appendChild(target);


/***/ })

},[89]);
//# sourceMappingURL=main-8a818dca85f2836765b5.js.map