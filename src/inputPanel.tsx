import * as React from "react";
import * as ReactDOM from "react-dom";
import {Block} from './block';
import {Lambda, LambdaFactory} from './lambda';
import {to_string} from './textPrinter';
import * as ev from './evaluate';
import * as utils from './utils';

declare var require:any;
import AceEditor from 'react-ace';


interface BlockState {
    evals: Lambda[][];
}

class InputBlock extends React.Component<{factory: LambdaFactory, value?: string}, BlockState> {

    private input: any;
    private block: Block;
    private code: string;
    private id = utils.randomString(12);

    constructor(props: any) {
        super(props);
        this.code = this.props.value || "";
        this.block = new Block(this.props.factory, undefined, () => {this.onCompile()})
        this.state = {evals: []}
    }

    private onCompile() {
        let exprs = this.block.expressions();
        this.setState({
            evals: exprs.map((expr) => {
                return ev.reduceAll(expr, ev.normalReduce, this.props.factory);
            })
        });
    }

    private execute(code: string) {
        this.code = code;
        this.block.setCode(code);
    }

    private onSubmit(editor: any) {
        this.execute(editor.getValue());
    }

    render() {
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
                        maxLines={20}
                        width=""
                        commands={[{
                            name: "submit",
                            bindKey: "shift-enter",
                            exec: (editor: any) => this.onSubmit(editor)
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
                <div>
                    {this.state.evals.map((lmbs) => {
                        return (
                            <div>
                                {lmbs.map((lmb) => <p>{to_string(lmb)}</p>)}
                            </div>
                            );
                    })}
                </div>
            </div>
        );
    }
}



export class InputPanel extends React.Component<{factory: LambdaFactory}, {blocks: JSX.Element[]}> {

    constructor(props: any) {
        super(props);
        this.state = { blocks: [<InputBlock factory={this.props.factory} value="pair a b f = f a b\nfst p = p (\\a b -> a)\nsnd p = p (\\a b -> b)\ndouble a = pair a a\nswap p = p (\\a b -> pair b a)\nfunc = snd (swap (pair c d))"/>]};
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