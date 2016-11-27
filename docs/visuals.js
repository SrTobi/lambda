"use strict";
const React = require("react");
const Utils = require("./utils");
/** small wrapper for bootstrap form groups */
class FormGroup extends React.Component {
    render() {
        return (React.createElement("div", {className: "form-group"}, 
            React.createElement("label", {htmlFor: this.props.id, className: "col-sm-6 control-label"}, this.props.label), 
            React.createElement("div", {className: "col-sm-6 " + (this.props.isStatic ? "form-control-static" : "")}, this.props.children)));
    }
}
exports.FormGroup = FormGroup;
/** small wrapper for bootstrap form checkboxes */
class CheckboxForm extends React.Component {
    constructor() {
        super(...arguments);
        this.id = this.props.id || Utils.randomString();
    }
    onChange() {
        this.props.onChange(this.input.checked);
    }
    render() {
        return (React.createElement(FormGroup, {label: this.props.label, id: this.props.id, isStatic: true}, 
            React.createElement("input", {type: "checkbox", checked: this.props.checked, id: this.id, ref: e => this.input = e, onChange: this.onChange.bind(this)})
        ));
    }
}
exports.CheckboxForm = CheckboxForm;
/** small wrapper for bootstrap form number field */
class NumberForm extends React.Component {
    constructor() {
        super(...arguments);
        this.id = this.props.id || Utils.randomString();
    }
    onChange() {
        this.props.onChange(+this.input.value);
    }
    render() {
        return (React.createElement(FormGroup, {label: this.props.label, id: this.props.id, isStatic: true}, 
            React.createElement("input", {type: "number", value: this.props.value, id: this.id, step: this.props.step, min: this.props.min, max: this.props.max, ref: e => this.input = e, onChange: this.onChange.bind(this)})
        ));
    }
}
exports.NumberForm = NumberForm;
//# sourceMappingURL=visuals.js.map