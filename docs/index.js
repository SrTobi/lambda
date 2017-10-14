"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var inputPanel_1 = require("./inputPanel");
var lambda_1 = require("./lambda");
require("jquery");
require("bootstrap/dist/js/bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("./css/style.css");
var GUI = /** @class */ (function (_super) {
    __extends(GUI, _super);
    function GUI() {
        var _this = _super.call(this) || this;
        _this.factory = new lambda_1.LambdaFactory();
        _this.state = { text: "Test" };
        return _this;
    }
    GUI.prototype.settingsChanged = function () {
    };
    GUI.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("a", { href: "https://github.com/srtobi/lambda" },
                React.createElement("img", { style: { position: "absolute", top: 0, right: 0, border: 0 }, src: "https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67", alt: "Fork me on GitHub", "data-canonical-src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" })),
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "page-header" },
                    React.createElement("h1", null,
                        "Lambda ",
                        React.createElement("small", null))),
                React.createElement(inputPanel_1.InputPanel, { factory: this.factory }))));
    };
    return GUI;
}(React.Component));
var target = document.createElement("div");
ReactDOM.render(React.createElement(GUI, null), target);
document.body.appendChild(target);
//# sourceMappingURL=index.js.map