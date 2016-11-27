import * as React from "react";
import * as ReactDOM from "react-dom";



export class InputPanel extends React.Component<{}, {}> {


    render() {
        return(
            <div className="panel panel-default config-panel">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        <a data-toggle="collapse" data-target=".panel-body">Settings</a>
                    </h3>
                </div>
                <div className="panel-body collapse in">
                    <div className="inputArea" contentEditable={true}>a.b.a b</div>
                </div>
            </div>
        );
    }
    
}