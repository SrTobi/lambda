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
var React = require("react");
var block_1 = require("./block");
var textPrinter_1 = require("./textPrinter");
var ev = require("./evaluate");
var utils = require("./utils");
var Visual = require("./visuals");
var react_ace_1 = require("react-ace");
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
        _this.code = _this.props.value || "";
        _this.block = new block_1.Block(_this.props.factory, _this.props.parent, function () { _this.onCompile(); });
        _this.state = { evals: [], strategy: ev.strategy.normal };
        return _this;
    }
    InputBlock.prototype.stopReducing = function () {
        this.reducers.forEach(function (r) { return r.stop(); });
        this.reducers = [];
        this.setState({ evaluating: false });
    };
    InputBlock.prototype.onCompile = function () {
        var _this = this;
        this.state.evaluating = true;
        var exprs = this.block.expressions();
        var strategy = this.state.strategy;
        this.reducers = exprs.map(function (expr) { return new ev.Reducer(expr, strategy, _this.props.factory); });
        this.compile(0, []);
    };
    InputBlock.prototype.endCompile = function (evals) {
        console.log(evals.length);
        this.stopReducing();
        this.setState({
            evals: evals
        });
    };
    InputBlock.prototype.compile = function (i, evals) {
        var _this = this;
        if (i < this.reducers.length) {
            this.reducers[i].run(function (steps, reduced) {
                evals.push(steps);
                _this.compile(i + 1, evals);
            }, function () {
                _this.endCompile(evals);
            });
        }
        else {
            this.endCompile(evals);
        }
    };
    InputBlock.prototype.execute = function (code, editor) {
        this.code = code;
        this.setState({ error: undefined, evaluating: true });
        editor.getSession().setAnnotations([]);
        try {
            this.block.setCode(code);
        }
        catch (e) {
            var err = e;
            this.setState({ error: err.message + " in line " + err.location.start.line + ", column " + err.location.start.column });
            editor.getSession().setAnnotations([{
                    row: err.location.start.line - 1,
                    column: err.location.start.column,
                    text: err.message,
                    type: "error" // also warning and information
                }]);
        }
    };
    InputBlock.prototype.onSubmit = function (editor) {
        this.execute(editor.getValue(), editor);
        this.props.onFinish(this.props.index, this.block);
    };
    InputBlock.prototype.onExecute = function (editor) {
        this.execute(editor.getValue(), editor);
    };
    InputBlock.prototype.render = function () {
        var _this = this;
        var evals = this.state.evals || [];
        var showAllAppl = this.state.showAllAppl || false;
        var execButton = "Run";
        return (React.createElement("div", { className: "input-block" },
            React.createElement("div", { className: "ace-container" },
                React.createElement(react_ace_1.default, { name: this.id, onKeyUp: function (o) { return _this.onSubmit(o); }, onLoad: function (e) { console.log(e); _this.input = e; }, fontSize: 15, className: "ace-input-area", minLines: 3, maxLines: 150, width: "", focus: true, commands: [{
                            name: "submit",
                            bindKey: "shift-enter",
                            exec: function (editor) { return _this.onSubmit(editor); }
                        }, {
                            name: "execute",
                            bindKey: "ctrl-enter",
                            exec: function (editor) { return _this.onExecute(editor); }
                        }], value: this.code, showPrintMargin: false, editorProps: {
                        $blockScrolling: true,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        tabSize: 2
                    } })),
            React.createElement("div", { className: "config-box" },
                React.createElement("div", { className: "left" },
                    React.createElement(Visual.Switch, { className: "showAll-switch", checked: showAllAppl, onChange: function (b) { _this.setState({ showAllAppl: b }); }, label: "Show all steps" })),
                React.createElement("div", { className: "right" },
                    React.createElement("select", { className: "strategy-select", ref: function (s) { return _this.strategySelect = s; }, onChange: function (sel) { return _this.setState({ strategy: toStrategy(sel.target.value) }); } },
                        React.createElement("option", { value: "normal" }, "Normal"),
                        React.createElement("option", { value: "name" }, "Call-By-Name"),
                        React.createElement("option", { value: "value" }, "Call-By-Value")),
                    React.createElement(Visual.ToggleButton, { className: "run-button", checked: !!this.state.evaluating, label: this.state.evaluating ? "Stop \u25FE" : "Run \u25B6", onChange: function (b) { if (b) {
                            _this.onExecute(_this.input);
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
                        return (React.createElement("div", { className: "expr-box" },
                            lmbs
                                .filter(function (lmb, idx) { return showAllAppl || idx == 0 || idx == lmbs.length - 1; })
                                .map(function (lmb, idx) { return React.createElement("div", { className: "appl-box" },
                                idx == 0 ? "" : "=>",
                                " ",
                                textPrinter_1.to_string(lmb)); }),
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
        if (this.setState) {
            this.setState({ blocks: this.state.blocks });
        }
    };
    InputPanel.prototype.render = function () {
        return (React.createElement("div", { className: "panel panel-default config-panel" },
            React.createElement("div", { className: "panel-heading" },
                React.createElement("h3", { className: "panel-title" },
                    React.createElement("a", { "data-toggle": "collapse", "data-target": ".panel-body" }, "Lambda Evaluator"))),
            React.createElement("div", { className: "panel-body collapse in" }, this.state.blocks)));
    };
    return InputPanel;
}(React.Component));
exports.InputPanel = InputPanel;
//# sourceMappingURL=inputPanel.js.map