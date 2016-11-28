import * as React from "react";
import * as ReactDOM from "react-dom";
import {Block} from './block';
import {Lambda, LambdaFactory} from './lambda';
import {to_string} from './textPrinter';
import * as ev from './evaluate';
import * as utils from './utils';
import * as Visual from './visuals';
import * as PegJs from 'pegjs';

declare var require:any;
import AceEditor from 'react-ace';

function toStrategy(strategy: string) {
    console.log(strategy);
    switch(strategy) {
        case "normal": return ev.strategy.normal;
        case "value": return ev.strategy.callByValue;
        case "name": return ev.strategy.callByName;
    }
    throw "unknown strategy";
}

interface BlockState {
    evals?: Lambda[][];
    error?: string;
    showAllAppl?: boolean;
    evaluating?: boolean;
    strategy?: ev.ReduceStrategy;
}

class InputBlock extends React.Component<{factory: LambdaFactory, value?: string, index: number, parent: Block | undefined, onFinish: (idx: number, block: Block) => void}, BlockState> {

    private input: any;
    private block: Block;
    private code: string;
    private id = utils.randomString(12);
    private reducers: ev.Reducer[] = [];
    private strategySelect: HTMLElement;

    constructor(props: any) {
        super(props);
        this.code = this.props.value || "";
        this.block = new Block(this.props.factory, this.props.parent, () => {this.onCompile()})
        this.state = {evals: [], strategy: ev.strategy.normal}
    }

    private stopReducing() {
        this.reducers.forEach(r => r.stop());
        this.reducers = [];
        this.setState({evaluating: false});
    }

    private onCompile() {
        this.state.evaluating = true;
        let exprs = this.block.expressions();
        let strategy = this.state.strategy as ev.ReduceStrategy;
        this.reducers = exprs.map(expr => new ev.Reducer(expr, strategy, this.props.factory));
        this.compile(0, []);
    }

    private endCompile(evals: Lambda[][]) {
        console.log(evals.length);
        this.stopReducing();
        this.setState({
            evals: evals
        });
    }


    private compile(i: number, evals: Lambda[][]) {
        if(i < this.reducers.length) {
            this.reducers[i].run((steps, reduced) => {
                evals.push(steps);
                this.compile(i + 1, evals);
            }, () => {
                this.endCompile(evals);
            });
        }else{
            this.endCompile(evals);
        }
    }

    private execute(code: string, editor: any) {
        this.setState({error: undefined, evaluating: true});
        this.code = code;
        editor.getSession().setAnnotations([]);
        try {
            this.block.setCode(code);
        }catch(e) {
            let err = e as PegJs.parser.SyntaxError;
            
            this.setState({error: err.message + " in line " + err.location.start.line + ", column " + err.location.start.column});

            editor.getSession().setAnnotations([{
                row: err.location.start.line-1,
                column: err.location.start.column,
                text: err.message,
                type: "error" // also warning and information
            }]);
        }
    }

    private onSubmit(editor: any) {
        this.execute(editor.getValue(), editor);
        this.props.onFinish(this.props.index, this.block);
    }

    private onExecute(editor: any) {
        this.execute(editor.getValue(), editor);
    }

    render() {
        let evals = this.state.evals || [];
        let showAllAppl = this.state.showAllAppl || false;
        let execButton = "Run";
        return(
            <div className="input-block">
                <div className="ace-container">
                    <AceEditor
                        name={this.id}
                        onKeyUp={(o: any) => this.onSubmit(o)}
                        onLoad={(e: any) => {console.log(e); this.input = e}}
                        fontSize={15}
                        className="ace-input-area"
                        minLines={3}
                        maxLines={150}
                        width=""
                        focus={true}
                        commands={[{
                            name: "submit",
                            bindKey: "shift-enter",
                            exec: (editor: any) => this.onSubmit(editor)
                        },{
                            name: "execute",
                            bindKey: "ctrl-enter",
                            exec: (editor: any) => this.onExecute(editor)
                        }]}
                        value={this.code}
                        showPrintMargin={false}
                        editorProps={{
                            $blockScrolling: true,
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            tabSize: 2
                        }}
                        />
                </div>
                <div className="config-box">
                    {/* Left site */}
                    <div className="left">
                        <Visual.Switch
                            className="showAll-switch"
                            checked={showAllAppl}
                            onChange={(b:boolean) =>{ this.setState({showAllAppl: b})}}
                            label="Show all steps" />
                    </div>

                    {/* Right site */}
                    <div className="right">
                        <select className="strategy-select" ref={(s) => this.strategySelect = s} onChange={(sel: any)=>this.setState({strategy: toStrategy(sel.target.value)})}>
                            <option value="normal">Normal</option>
                            <option value="name">Call-By-Name</option>
                            <option value="value">Call-By-Value</option>
                        </select>
                        <Visual.ToggleButton
                            className="run-button"
                            checked={!!this.state.evaluating}
                            label={this.state.evaluating? "Stop \u25FE" : "Run \u25B6"}
                            onChange={(b:boolean) =>{if(b) {this.onExecute(this.input)} else this.stopReducing();} } />
                    </div>
                    <div className="float-clear" />
                </div>
                {this.state.error?
                    <div className="error-box">
                        Error: {this.state.error}
                    </div>
                    :
                    <div className="output-box">
                        {evals.map((lmbs) => {
                            return (
                                <div className="expr-box">
                                    {lmbs
                                        .filter((lmb, idx) => showAllAppl || idx == 0 || idx == lmbs.length - 1)
                                        .map((lmb, idx) => <div className="appl-box">{idx == 0? "" : "=>"} {to_string(lmb)}</div>)
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



export class InputPanel extends React.Component<{factory: LambdaFactory}, {blocks: JSX.Element[]}> {

    constructor(props: any) {
        super(props);
        this.state = {blocks: []};
        this.addInputBlock(undefined);
    }

    addInputBlock(block: Block | undefined) {
        let idx = this.state.blocks.length;
        let newB = (<InputBlock factory={this.props.factory} index={idx} parent={block} onFinish={(from, blk) => {
            if(from + 1 >= this.state.blocks.length) {
                this.addInputBlock(blk);
            }
        }}/>);
        this.state.blocks.push(newB);
        if(this.setState) {
            this.setState({blocks: this.state.blocks});
        }
    }

    render() {
        return(
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