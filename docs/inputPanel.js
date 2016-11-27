"use strict";
const React = require("react");
const block_1 = require('./block');
const textPrinter_1 = require('./textPrinter');
const ev = require('./evaluate');
const utils = require('./utils');
const react_ace_1 = require('react-ace');
class InputBlock extends React.Component {
    constructor(props) {
        super(props);
        this.id = utils.randomString(12);
        this.code = this.props.value || "";
        this.block = new block_1.Block(this.props.factory, undefined, () => { this.onCompile(); });
        this.state = { evals: [] };
    }
    onCompile() {
        let exprs = this.block.expressions();
        this.setState({
            evals: exprs.map((expr) => {
                return ev.reduceAll(expr, ev.normalReduce, this.props.factory);
            })
        });
    }
    execute(code) {
        this.code = code;
        this.block.setCode(code);
    }
    onSubmit(editor) {
        this.execute(editor.getValue());
    }
    render() {
        return (React.createElement("div", {className: "input-block"}, 
            React.createElement("div", {className: "ace-container"}, 
                React.createElement(react_ace_1.default, {name: this.id, onKeyUp: (o) => this.onSubmit(o), ref: (e) => this.input = e, fontSize: 15, className: "ace-input-area", minLines: 3, maxLines: 20, width: "", commands: [{
                        name: "submit",
                        bindKey: "shift-enter",
                        exec: (editor) => this.onSubmit(editor)
                    }], value: this.code, showPrintMargin: false, editorProps: {
                    $blockScrolling: true,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    tabSize: 2
                }})
            ), 
            React.createElement("div", null, this.state.evals.map((lmbs) => {
                return (React.createElement("div", null, lmbs.map((lmb) => React.createElement("p", null, textPrinter_1.to_string(lmb)))));
            }))));
    }
}
class InputPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { blocks: [React.createElement(InputBlock, {factory: this.props.factory, value: "pair a b f = f a b\nfst p = p (\\a b -> a)\nsnd p = p (\\a b -> b)\ndouble a = pair a a\nswap p = p (\\a b -> pair b a)\nfunc = snd (swap (pair c d))"})] };
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
//# sourceMappingURL=inputPanel.js.map