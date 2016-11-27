import * as React from "react";
import * as ReactDOM from "react-dom";
import {Settings, SettingsPanel} from './settings';
import {InputPanel} from './inputPanel';
import {LambdaFactory} from './lambda';
import * as $ from "jquery";

import "jquery";
import "bootstrap/dist/js/bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/style.css";


class GUI extends React.Component<{}, {text: string}> {

	private input: HTMLInputElement;
	private factory = new LambdaFactory();

	constructor() {
		super();
		this.state = {text: "Test"};
	}

	private settingsChanged() {

	}

	render() {
		return (
			<div>
				<div className="container">
					<div className="page-header">
						<h1>Lambda <small></small></h1>
					</div>
					<InputPanel factory={this.factory} />
				</div>
			</div>
		);
	}
}

var target = document.createElement("div");
ReactDOM.render(<GUI />, target);
document.body.appendChild(target);