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
				<a href="https://github.com/srtobi/lambda">
					<img
						style={{position: "absolute", top: 0, right: 0, border: 0}}
						src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67"
						alt="Fork me on GitHub"
						data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" />
				</a>
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