import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Utils from "./utils";


/** small wrapper for bootstrap form groups */
export class FormGroup extends React.Component<{
		label: string, children?: any, id?:string, isStatic?:boolean
	}, {}> {

	render() {
		return (
            <div className="form-group">
                <label htmlFor={this.props.id} className="col-sm-6 control-label">{this.props.label}</label>
                <div className={"col-sm-6 "+(this.props.isStatic?"form-control-static":"")}>{this.props.children}</div>
            </div>
        );
	}
}


/** small wrapper for bootstrap form checkboxes */
export class CheckboxForm extends React.Component<{checked: boolean, label: string, id?: string, onChange: (checked: boolean) => void}, {}> {

	private input: HTMLInputElement;
	private id = this.props.id || Utils.randomString();

	private onChange(): void {
		this.props.onChange(this.input.checked);
	}

	render() {
		return (
			<FormGroup label={this.props.label} id={this.props.id} isStatic>
				<input type="checkbox" checked={this.props.checked} id={this.id} ref={e => this.input = e!} onChange={this.onChange.bind(this)} />
			</FormGroup>
		);
	}
}

/** small wrapper for bootstrap form number field */
export class NumberForm extends React.Component<{value: number, step?: number, min?: number, max?: number, label: string, id?: string, onChange: (value: number) => void}, {}> {

	private input: HTMLInputElement;
	private id = this.props.id || Utils.randomString();

	private onChange(): void {
		this.props.onChange(+this.input.value);
	}

	render() {
		return (
			<FormGroup label={this.props.label} id={this.props.id} isStatic>
				<input
					type="number"
					value={this.props.value}
					id={this.id}
					step={this.props.step}
					min={this.props.min}
					max={this.props.max}
					ref={e => this.input = e!}
					onChange={this.onChange.bind(this)} />
			</FormGroup>
		);
	}
}


export class Switch extends React.Component<{className?: string, checked: boolean, label: string, id?: string, onChange: (checked: boolean) => void}, {}> {

	private input: HTMLInputElement;
	private id = this.props.id || Utils.randomString();

	private onChange(): void {
		this.props.onChange(this.input.checked);
	}

	render() {
		return (
			<span className={"switch-grouper " + (this.props.className || "")}>
                <label htmlFor={this.id}>{this.props.label}</label>
				<label className="switch">
					<input type="checkbox" checked={this.props.checked} id={this.id} ref={e => this.input = e!} onChange={this.onChange.bind(this)} />
					<div className="slider"></div>
				</label>
			</span>
		);
	}
}


export class ToggleButton extends React.Component<{className?: string, checked: boolean, label: string, id?: string, onChange: (checked: boolean) => void}, {}> {

	private input: HTMLInputElement;
	private id = this.props.id || Utils.randomString();

	private onChange(): void {
		this.props.onChange(this.input.checked);
	}

	render() {
		return (
			<label className={"toggle " + (this.props.className || "")}>
				<input type="checkbox" checked={this.props.checked} id={this.id} ref={e => this.input = e!} onChange={this.onChange.bind(this)} />
				<div className="toggle-view">{this.props.label}</div>
			</label>
		);
	}
}
