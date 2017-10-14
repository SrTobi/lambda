import * as React from "react";
import * as ReactDOM from "react-dom";
import { Block } from './block';
import { Lambda, Application, LambdaFactory } from './lambda';
import { to_string, PrintOptions } from './textPrinter';
import * as ev from './evaluate';
import * as utils from './utils';
import * as Visual from './visuals';
import * as PegJs from 'pegjs';
import MonacoEditor from 'react-monaco-editor';


declare var require: any;

function toStrategy(strategy: string) {
    console.log(strategy);
    switch (strategy) {
        case "normal": return ev.strategy.normal;
        case "value": return ev.strategy.callByValue;
        case "name": return ev.strategy.callByName;
    }
    throw "unknown strategy";
}

interface InputBlockProperties {
    factory: LambdaFactory;
    value?: string;
    index: number;
    parent: Block | undefined;
    onFinish: (idx: number, block: Block) => void;
}

// [the resulting lambda, the reduced application]
type LambdaReduction = [Lambda, Application]

interface InputBlockState {
    evals?: LambdaReduction[][];
    error?: string;
    attemptsToCompileZeroExpressions: number;
    showAllAppl: boolean;
    transformAliases: boolean;
    evaluating?: boolean;
    strategy?: ev.ReduceStrategy;
}

class InputBlock extends React.Component<InputBlockProperties, InputBlockState> {

    private block: Block;
    private editor: monaco.editor.IStandaloneCodeEditor;
    private id = utils.randomString(12);
    private reducers: ev.Reducer[] = [];
    private strategySelect: HTMLElement;

    constructor(props: any) {
        super(props);
        this.block = new Block(this.props.factory, this.props.parent, () => { this.startReducing() })
        this.block.setCode(this.props.value || "");
        this.state = {
            evals: [],
            strategy: ev.strategy.normal,
            attemptsToCompileZeroExpressions: 0,
            showAllAppl: false,
            transformAliases: true
        }

        window.addEventListener('resize', () => this.editor.layout());
    }

    private stopReducing() {
        this.reducers.forEach(r => r.stop());
        this.reducers = [];
        this.setState({ evaluating: false });
    }

    private startReducing() {
        let exprs = this.block.expressions();
        console.log("attempts: ", this.state.attemptsToCompileZeroExpressions);
        if (exprs.length) {
            this.setState({attemptsToCompileZeroExpressions: 0});
            this.stopReducing();
            this.setState({ evaluating: true });
            let strategy = this.state.strategy as ev.ReduceStrategy;
            this.reducers = exprs.map(expr => new ev.Reducer(expr, strategy, this.props.factory));
            this.doReducing(0, []);
        } else {
            this.endReducing([]);
            this.setState({attemptsToCompileZeroExpressions: this.state.attemptsToCompileZeroExpressions + 1});
        }
    }

    private endReducing(evals: LambdaReduction[][]) {
        console.log(evals.length);
        this.stopReducing();
        this.setState({
            evals: evals
        });
    }


    private doReducing(i: number, evals: LambdaReduction[][]) {
        if (i < this.reducers.length) {
            this.reducers[i].run((steps, reduced) => {
                let zip = steps.map((s, i) => [s, reduced[i]] as LambdaReduction);
                evals.push(zip);
                this.doReducing(i + 1, evals);
            }, () => {
                this.endReducing(evals);
            });
        } else {
            this.endReducing(evals);
        }
    }

    private commitCodeToBlock() {
        const code = this.block.getCode();
        console.log(code);
        this.setState({ error: undefined, evaluating: true });
        //this.editor.getSession().setAnnotations([]);
        try {
            this.block.setCodeAndCompile(code);
            return true;
        } catch (e) {
            const err = e as PegJs.parser.SyntaxError;
            const { message, location } = err;
            const { line, column } = location.start;

            this.setError(`${message} in line ${line}, column ${column}`);

            /*this.editor.getSession().setAnnotations([{
                row: err.location.start.line-1,
                column: err.location.start.column,
                text: err.message,
                type: "error" // also warning and information
            }]);*/
            this.stopReducing();
            return false;
        }
    }

    private setError(msg: string) {
        this.setState({ error: msg });
    }

    private onSubmit() {
        this.setState({attemptsToCompileZeroExpressions: 0});

        // compile, start reducing and add new block
        if (this.commitCodeToBlock()) {
            this.props.onFinish(this.props.index, this.block);
        }
    }

    private onExecute() {
        // compile and start reducing
        this.commitCodeToBlock();
    }

    private editorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
        editor.focus();
        editor.addAction({
            label: "Execute Block",
            id: "execute",
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],
            run: () => this.onExecute()
        });
        editor.addAction({
            label: "Submit Block",
            id: "submit",
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyCode.Enter
            ],
            run: () => this.onSubmit()
        });

        this.editor = editor;
    }

    render() {
        const evals = this.state.evals || []
        const showAllAppl = this.state.showAllAppl
        const transformAliases = this.state.transformAliases

        const options: monaco.editor.IEditorOptions = {
            automaticLayout: true,
            scrollbar: {
                useShadows: false
            },
            fontFamily: "monaco"
        };
        return (
            <div className="input-block">
                <div className="editor-container">
                    <MonacoEditor
                        height={400}
                        width="100%"
                        language=""
                        value={this.block.getCode()}
                        onChange={code => this.block.setCode(code)}
                        editorDidMount={e => this.editorDidMount(e as monaco.editor.IStandaloneCodeEditor)}
                    />
                </div>
                <div className="config-box">
                    {/* Left site */}
                    <div className="config-group left">
                        <Visual.Switch
                            className="showAll-switch"
                            checked={showAllAppl}
                            onChange={(b) => { this.setState({ showAllAppl: b }) }}
                            label="Show all steps" />
                        <Visual.Switch
                            className="transformAliases-switch"
                            checked={transformAliases}
                            onChange={(b) => { this.setState({ transformAliases: b }) }}
                            label="Transform Aliases" />
                    </div>

                    {/* Right site */}
                    <div className="config-group right">
                        <span className={"expression-count-box" + (this.state.attemptsToCompileZeroExpressions > 1 ? " too-many-zero-expression-attempts" : "")}>
                            {evals.length == 0 ? "No expressions" : ''}
                        </span>
                        <select className="strategy-select" ref={(s) => this.strategySelect = s!} onChange={(sel: any) => this.setState({ strategy: toStrategy(sel.target.value) })}>
                            <option value="normal">Normal</option>
                            <option value="name">Call-By-Name</option>
                            <option value="value">Call-By-Value</option>
                        </select>
                        <Visual.ToggleButton
                            className="run-button"
                            checked={!!this.state.evaluating}
                            label={this.state.evaluating ? "Stop \u25FE" : "Run \u25B6"}
                            onChange={(b) => { if (b) { this.onExecute() } else this.stopReducing(); }} />
                    </div>
                    <div className="float-clear" />
                </div>
                {this.state.error ?
                    <div className="error-box">
                        Error: {this.state.error}
                    </div>
                    :
                    <div className="output-box">
                        {evals.map((lmbs) => {
                            function underline_appl(f: string, a: string): [string, string] {
                                return [
                                    `<u class="redex-func">${f}</u>`,
                                    `<u class="redex-arg">${a}</u>`
                                ]
                            }
                            function print_lmb([lmb, app]: LambdaReduction, idx: number): string[] {
                                let ops: PrintOptions = {}
                                if (app) {
                                    ops.appl_pp = new Map([[app, underline_appl]])
                                }
                                let result = [(idx == 0 ? "" : "=> ") + to_string(lmb, ops)]

                                if (app && showAllAppl && transformAliases) {
                                    let f = app.func();
                                    if (f.alias()) {
                                        ops.force_expand_aliases = new Set([f])
                                        result.push("&nbsp;= " + to_string(lmb, ops));
                                    }
                                }
                                return result
                            }

                            return (
                                <div className="expr-box">
                                    {lmbs
                                        .filter((_, idx) => showAllAppl || idx == 0 || idx == lmbs.length - 1)
                                        .map(print_lmb)
                                        .map(ss => ss.map((s, i) => <div className={"appl-box" + (i? " aliasTransform" : "")} dangerouslySetInnerHTML={{__html: s}} />))
                                    }
                                    <div className="reduce-box">{lmbs.length - 1} Steps</div>
                                </div>
                            );
                        })}
                    </div>
                }
            </div>
        );
    }
}



export class InputPanel extends React.Component<{ factory: LambdaFactory }, { blocks: JSX.Element[] }> {

    constructor(props: any) {
        super(props);
        this.state = { blocks: [] };
        this.addInputBlock(undefined);
    }

    addInputBlock(block: Block | undefined) {
        let idx = this.state.blocks.length;
        let newB = (<InputBlock factory={this.props.factory} index={idx} parent={block} onFinish={(from, blk) => {
            if (from + 1 >= this.state.blocks.length) {
                this.addInputBlock(blk);
            }
        }} />);
        this.state.blocks.push(newB);
        this.setState({ blocks: this.state.blocks });
    }

    render() {
        return (
            <div className="panel panel-default config-panel">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        <a data-toggle="collapse" data-target=".panel-body">Lambda Evaluator</a>
                    </h3>
                </div>
                <div className="panel-body collapse in">
                    {this.state.blocks}
                </div>
            </div>
        );
    }

}