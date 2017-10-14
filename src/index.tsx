import * as React from "react";
import * as ReactDOM from "react-dom";
import { InputPanel } from './inputPanel';
import { LambdaFactory } from './lambda';
import * as $ from "jquery";

import "jquery";
import "bootstrap/dist/js/bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/style.css";


class GUI extends React.Component<{}, { text: string }> {

	private input: HTMLInputElement;
	private factory = new LambdaFactory();

	constructor() {
		super();
		this.state = { text: "Test" };
	}

	private settingsChanged() {

	}

	render() {
		return (
			<div>
				<a href="https://github.com/srtobi/lambda">
					<img
						style={{ position: "absolute", top: 0, right: 0, border: 0 }}
						src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67"
						alt="Fork me on GitHub"
						data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" />
				</a>
				<div className="container">
					<div className="page-header">
						<h1>Lambda <small>by <a href="https://github.com/SrTobi/">SrTobi</a></small></h1>
					</div>
					<InputPanel factory={this.factory} />

					<div className="panel panel-default config-panel">
						<div className="panel-heading">
							<h3 className="panel-title">
								<a data-toggle="collapse" data-target="#manual-panel">Manual</a>
							</h3>
						</div>
						<div className="panel-body collapse" id="manual-panel">
							<p>
								This tool lets you evaluate lambda expressions.
								Just enter your code into the code box above and click <b>Run</b> or press <i><code>Strg+Enter</code>.</i>
								You may also create a new code box: just press <i><code>Shift+Enter</code></i>.
							</p>

							<h4>Lambda</h4>
							<p>
								Lambda expressions can be written in the usual way.
							</p>

							<pre>(\arg.arg var) (\i.i)</pre>

							<p>
								In the box below the code you can now see how your expression is evaluated.
								The underlines will indicate the redix that is currentliy evaluated.
							</p>

							<pre>(\arg.arg var) (\i.i)<br />
									=> (\i.i) var<br />
									=> var</pre>

							<p>
								You may also define aliases for lambda expressions. Just assign them to a name using <code>[alias] = [lambda]</code>.
								The alias will then act as if it were the assigned expression.
								Remember that you <b>can not</b> use the alias in the expression itself!
							</p>
							<pre>
								id = (\i.i)<br />
								(\arg.arg var) id
							</pre>

							<p>
								If you have <code>Transform Aliases</code> activated an alias will be transformed to its definition befor it gets evaluated.
							</p>
							<pre>
							(\arg.arg var) id<br />
							=> id var<br />
							&nbsp;= (\i.i) var<br />
							=> var
							</pre>


							<h4>Syntactic sugar</h4>
							<p style={{color:"red"}}><b>Do not</b> use the following syntax in your exam!</p>
							<p>To make things easier there are two shortcuts regarding arguments:</p>

							<pre>
								// the following lines are equivalent<br />
								func a b = expr<br />
								func = \a.\b.expr<br />
								<br />
								// the following lines are equivalent<br />
								\a b -> expr<br />
								\a.\b.expr<br />
							</pre>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

var target = document.createElement("div");
ReactDOM.render(<GUI />, target);
document.body.appendChild(target);