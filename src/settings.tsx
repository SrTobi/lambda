import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Visuals from "./visuals";
import * as Utils from './utils';

export interface Transitions {
    forward: number,
    right: number,
    left: number,
    backward: number
}

export interface Settings {
    rewardPerStep: number,
    rewardPerWallStep: number,
    allowWallStep: boolean,
    transitionProbabilityRatio: Transitions
}

export function transitionProbability(settings: Settings): Transitions {
    let tpr = settings.transitionProbabilityRatio;
    let overall = tpr.forward + tpr.left + tpr.right + tpr.backward;
    if(overall <= 0) {
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

interface SettingsProperties {
    onSettingsChanged: (settings: Settings) => void
}

export class SettingsPanel extends React.Component<SettingsProperties, Settings> {

    private forwardProbInput: HTMLInputElement;
    private leftProbInput: HTMLInputElement;
    private rightProbInput: HTMLInputElement;
    private backwardProbInput: HTMLInputElement;

    constructor(prop: SettingsProperties) {
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
        }
    }

    private onRewardPerStepChange(value: number): void {
        this.setState({rewardPerStep: value} as Settings);
    }

    private onRewardPerWallStepChange(value: number): void {
        this.setState({rewardPerWallStep: value} as Settings);
    }

    private onAllowWallStepChange(checked: boolean): void {
        this.setState({allowWallStep: checked} as Settings);
    }

    private onTransitionProbabilityChange(): void {
        let transitions: Transitions = {
            forward: +this.forwardProbInput.value,
            left: +this.leftProbInput.value,
            right: +this.rightProbInput.value,
            backward: +this.backwardProbInput.value
        };

        this.setState({transitionProbabilityRatio: transitions} as Settings);
    }

    render() {
        let transProb = this.state.transitionProbabilityRatio;
        return (
            <div className="panel panel-default config-panel">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        <a data-toggle="collapse" data-target=".panel-body">Settings</a>
                    </h3>
                </div>
                <div className="panel-body collapse in">
                    <div className="col-sm-6">
                        <h4>Rewards</h4>
                        <Visuals.NumberForm
                            label="Reward per step"
                            step={0.1}
                            value={this.state.rewardPerStep}
                            onChange={this.onRewardPerStepChange.bind(this)} />
                        <Visuals.NumberForm 
                            label="Reward per step against wall"
                            step={0.1}
                            value={this.state.rewardPerWallStep}
                            onChange={this.onRewardPerWallStepChange.bind(this)} />
                        <Visuals.CheckboxForm
                            label="Allow step agains wall"
                            checked={this.state.allowWallStep}
                            onChange={this.onAllowWallStepChange.bind(this)} />
                    </div>
                    <div className="col-sm-6">
                        <h4>Transitions</h4>
                        <div className="transition-prob-control">
                            <div className="text-center">
                                <input type="number"
                                    value={transProb.forward}
                                    min={0}
                                    step={1}
                                    ref={e => this.forwardProbInput = e}
                                    onChange={this.onTransitionProbabilityChange.bind(this)} />
                            </div>
                            <div className="text-center">
                                {Utils.normFloat(transitionProbability(this.state).forward)}
                            </div>
                            <div className="text-center">
                                <input type="number"
                                    value={transProb.left}
                                    min={0}
                                    step={1}
                                    ref={e => this.leftProbInput = e}
                                    onChange={this.onTransitionProbabilityChange.bind(this)} />
                                {Utils.normFloat(transitionProbability(this.state).left)}
                                {"\u2190 \u21C5 \u2192"}
                                {Utils.normFloat(transitionProbability(this.state).right)}
                                <input type="number"
                                    value={transProb.right}
                                    min={0}
                                    step={1}
                                    ref={e => this.rightProbInput = e}
                                    onChange={this.onTransitionProbabilityChange.bind(this)} />
                            </div>
                            <div className="text-center">
                                {Utils.normFloat(transitionProbability(this.state).backward)}
                            </div>
                            <div className="text-center">
                                <input type="number"
                                    value={transProb.backward}
                                    min={0}
                                    step={1}
                                    ref={e => this.backwardProbInput = e}
                                    onChange={this.onTransitionProbabilityChange.bind(this)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}