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
var Utils = require("./utils");
/** small wrapper for bootstrap form groups */
var FormGroup = /** @class */ (function (_super) {
    __extends(FormGroup, _super);
    function FormGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormGroup.prototype.render = function () {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { htmlFor: this.props.id, className: "col-sm-6 control-label" }, this.props.label),
            React.createElement("div", { className: "col-sm-6 " + (this.props.isStatic ? "form-control-static" : "") }, this.props.children)));
    };
    return FormGroup;
}(React.Component));
exports.FormGroup = FormGroup;
/** small wrapper for bootstrap form checkboxes */
var CheckboxForm = /** @class */ (function (_super) {
    __extends(CheckboxForm, _super);
    function CheckboxForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    CheckboxForm.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    CheckboxForm.prototype.render = function () {
        var _this = this;
        return (React.createElement(FormGroup, { label: this.props.label, id: this.props.id, isStatic: true },
            React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) })));
    };
    return CheckboxForm;
}(React.Component));
exports.CheckboxForm = CheckboxForm;
/** small wrapper for bootstrap form number field */
var NumberForm = /** @class */ (function (_super) {
    __extends(NumberForm, _super);
    function NumberForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    NumberForm.prototype.onChange = function () {
        this.props.onChange(+this.input.value);
    };
    NumberForm.prototype.render = function () {
        var _this = this;
        return (React.createElement(FormGroup, { label: this.props.label, id: this.props.id, isStatic: true },
            React.createElement("input", { type: "number", value: this.props.value, id: this.id, step: this.props.step, min: this.props.min, max: this.props.max, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) })));
    };
    return NumberForm;
}(React.Component));
exports.NumberForm = NumberForm;
var Switch = /** @class */ (function (_super) {
    __extends(Switch, _super);
    function Switch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    Switch.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    Switch.prototype.render = function () {
        var _this = this;
        return (React.createElement("span", { className: "switch-grouper " + (this.props.className || "") },
            React.createElement("label", { htmlFor: this.id }, this.props.label),
            React.createElement("label", { className: "switch" },
                React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) }),
                React.createElement("div", { className: "slider" }))));
    };
    return Switch;
}(React.Component));
exports.Switch = Switch;
var ToggleButton = /** @class */ (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = _this.props.id || Utils.randomString();
        return _this;
    }
    ToggleButton.prototype.onChange = function () {
        this.props.onChange(this.input.checked);
    };
    ToggleButton.prototype.render = function () {
        var _this = this;
        return (React.createElement("label", { className: "toggle " + (this.props.className || "") },
            React.createElement("input", { type: "checkbox", checked: this.props.checked, id: this.id, ref: function (e) { return _this.input = e; }, onChange: this.onChange.bind(this) }),
            React.createElement("div", { className: "toggle-view" }, this.props.label)));
    };
    return ToggleButton;
}(React.Component));
exports.ToggleButton = ToggleButton;
//# sourceMappingURL=visuals.js.map