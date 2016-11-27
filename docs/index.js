"use strict";
const React = require("react");
const ReactDOM = require("react-dom");
const inputPanel_1 = require('./inputPanel');
const lambda_1 = require('./lambda');
require("jquery");
require("bootstrap/dist/js/bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("./css/style.css");
class GUI extends React.Component {
    constructor() {
        super();
        this.factory = new lambda_1.LambdaFactory();
        this.state = { text: "Test" };
    }
    settingsChanged() {
    }
    render() {
        return (React.createElement("div", null, 
            React.createElement("div", {className: "container"}, 
                React.createElement("div", {className: "page-header"}, 
                    React.createElement("h1", null, 
                        "Lambda ", 
                        React.createElement("small", null))
                ), 
                React.createElement(inputPanel_1.InputPanel, {factory: this.factory}))
        ));
    }
}
var target = document.createElement("div");
ReactDOM.render(React.createElement(GUI, null), target);
document.body.appendChild(target);
//# sourceMappingURL=index.js.map