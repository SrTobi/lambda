"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Visuals = require("./visuals");
const Utils = require("./utils");
function transitionProbability(settings) {
    let tpr = settings.transitionProbabilityRatio;
    let overall = tpr.forward + tpr.left + tpr.right + tpr.backward;
    if (overall <= 0) {
        return {
            forward: 1,
            right: 0,
            left: 0,
            backward: 0
        };
    }
    return {
        forward: tpr.forward / overall,
        right: tpr.right / overall,
        left: tpr.left / overall,
        backward: tpr.backward / overall
    };
}
exports.transitionProbability = transitionProbability;
class SettingsPanel extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            rewardPerStep: -0.2,
            rewardPerWallStep: -0.2,
            allowWallStep: true,
            transitionProbabilityRatio: {
                forward: 80,
                right: 10,
                left: 10,
                backward: 0
            }
        };
    }
    onRewardPerStepChange(value) {
        this.setState({ rewardPerStep: value });
    }
    onRewardPerWallStepChange(value) {
        this.setState({ rewardPerWallStep: value });
    }
    onAllowWallStepChange(checked) {
        this.setState({ allowWallStep: checked });
    }
    onTransitionProbabilityChange() {
        let transitions = {
            forward: +this.forwardProbInput.value,
            left: +this.leftProbInput.value,
            right: +this.rightProbInput.value,
            backward: +this.backwardProbInput.value
        };
        this.setState({ transitionProbabilityRatio: transitions });
    }
    render() {
        let transProb = this.state.transitionProbabilityRatio;
        return (React.createElement("div", { className: "panel panel-default config-panel" },
            React.createElement("div", { className: "panel-heading" },
                React.createElement("h3", { className: "panel-title" },
                    React.createElement("a", { "data-toggle": "collapse", "data-target": ".panel-body" }, "Settings"))),
            React.createElement("div", { className: "panel-body collapse in" },
                React.createElement("div", { className: "col-sm-6" },
                    React.createElement("h4", null, "Rewards"),
                    React.createElement(Visuals.NumberForm, { label: "Reward per step", step: 0.1, value: this.state.rewardPerStep, onChange: this.onRewardPerStepChange.bind(this) }),
                    React.createElement(Visuals.NumberForm, { label: "Reward per step against wall", step: 0.1, value: this.state.rewardPerWallStep, onChange: this.onRewardPerWallStepChange.bind(this) }),
                    React.createElement(Visuals.CheckboxForm, { label: "Allow step agains wall", checked: this.state.allowWallStep, onChange: this.onAllowWallStepChange.bind(this) })),
                React.createElement("div", { className: "col-sm-6" },
                    React.createElement("h4", null, "Transitions"),
                    React.createElement("div", { className: "transition-prob-control" },
                        React.createElement("div", { className: "text-center" },
                            React.createElement("input", { type: "number", value: transProb.forward, min: 0, step: 1, ref: e => this.forwardProbInput = e, onChange: this.onTransitionProbabilityChange.bind(this) })),
                        React.createElement("div", { className: "text-center" }, Utils.normFloat(transitionProbability(this.state).forward)),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("input", { type: "number", value: transProb.left, min: 0, step: 1, ref: e => this.leftProbInput = e, onChange: this.onTransitionProbabilityChange.bind(this) }),
                            Utils.normFloat(transitionProbability(this.state).left),
                            "\u2190 \u21C5 \u2192",
                            Utils.normFloat(transitionProbability(this.state).right),
                            React.createElement("input", { type: "number", value: transProb.right, min: 0, step: 1, ref: e => this.rightProbInput = e, onChange: this.onTransitionProbabilityChange.bind(this) })),
                        React.createElement("div", { className: "text-center" }, Utils.normFloat(transitionProbability(this.state).backward)),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("input", { type: "number", value: transProb.backward, min: 0, step: 1, ref: e => this.backwardProbInput = e, onChange: this.onTransitionProbabilityChange.bind(this) })))))));
    }
}
exports.SettingsPanel = SettingsPanel;
//# sourceMappingURL=settings.js.map