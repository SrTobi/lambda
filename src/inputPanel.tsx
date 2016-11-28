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


interface BlockState {
    evals?: Lambda[][];
    error?: string;
    showAllAppl?: boolean;
}

class InputBlock extends React.Component<{factory: LambdaFactory, value?: string, index: number, parent: Block | undefined, onFinish: (idx: number, block: Block) => void}, BlockState> {

    private input: any;
    private block: Block;
    private code: string;
    private id = utils.randomString(12);

    constructor(props: any) {
        super(props);
        this.code = this.props.value || "";
        this.block = new Block(this.props.factory, this.props.parent, () => {this.onCompile()})
        this.state = {evals: [], error: undefined}
    }

    private onCompile() {
        let exprs = this.block.expressions();
        this.setState({
            evals: exprs.map((expr) => {
                return ev.reduceAll(expr, ev.normalReduce, this.props.factory);
            })
        });
    }

    private execute(code: string, editor: any) {
        this.code = code;
        this.setState({error: undefined});
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
        return(
            <div className="input-block">
                <div className="ace-container">
                    <AceEditor
                        name={this.id}
                        onKeyUp={(o: any) => this.onSubmit(o)}
                        ref={(e: any) => this.input = e}
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
                    <Visual.Switch checked={showAllAppl} onChange={(b:boolean) =>{ this.setState({showAllAppl: b})}} label="Show all steps" />
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