import {Lambda, Application, Definition, Variable, Abstraction, GlobalDef, LambdaVisitor, LambdaFactory} from './lambda';


export type ReduceStrategy = (lmb: Lambda) => Application | undefined;

export namespace strategy {
    export function normal(lmb: Lambda): Application | undefined {
        return new NormalReduceVisitor().do_visit(lmb);
    }

    export function callByValue(lmb: Lambda): Application | undefined {
        return new CallByValueReduceVisitor().do_visit(lmb);
    }

    export function callByName(lmb: Lambda): Application | undefined {
        return new CallByNameReduceVisitor().do_visit(lmb);
    }
}

export function reduce(lmb: Lambda, strategy: ReduceStrategy, factory: LambdaFactory): Lambda | undefined {
    let redex = strategy(lmb);
    return redex? factory.reduce(lmb, redex) : undefined;
}

export function reduceAll(lmb: Lambda, strategy: ReduceStrategy, factory: LambdaFactory): Lambda[] {
    let steps: Lambda[] = [lmb];
    let step: Lambda | undefined;
    while(step = reduce(lmb, strategy, factory)) {
        steps.push(step);
        lmb = step;
    }

    return steps;
}

type ReducerCallback = (steps: Lambda[], reduced: Application[]) => void;

export class Reducer {
    
    private curLambda: Lambda | undefined;
    private result: Lambda[];
    private reduced: Application[] = [];
    private running = false;

    constructor(private initLambda: Lambda, private strategy: ReduceStrategy, private factory: LambdaFactory) {
        this.curLambda = initLambda;
        this.result = [initLambda];
    }

    public run(result: ReducerCallback, abort?: () => void) {
        this.running = true;
        this.next(result, abort || (() => {}));
    }

    public stop() {
        this.running = false;
    }

    private next(result: ReducerCallback, abort: () => void) {
        if(!this.running) {
            abort();
        }else if(this.curLambda) {
            requestAnimationFrame(() => {
                this.step();
                this.next(result, abort);
            });
        }else{
            console.log("end");
            this.stop();
            result(this.result, this.reduced);
        }
    }

    public step() {
        for(let i = 0; i < 10; ++i) {
            if(!this.curLambda) {
                return;
            }

            let redex = this.strategy(this.curLambda);
            if(!redex) {
                this.curLambda = undefined;
                return;
            }

            this.curLambda = this.factory.reduce(this.curLambda, redex);

            if(this.curLambda) {
                this.result.push(this.curLambda);
                this.reduced.push(redex);
            }
        }
    }
}

class NormalReduceVisitor extends LambdaVisitor<Application | undefined> {

    visit_appl(node: Application): Application | undefined {
        if(node.isRedex()) {
            return node;
        }
        let redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    }

    visit_abst(node: Abstraction): Application | undefined {
        return this.do_visit(node.body());
    }

    visit_var(node: Variable): Application | undefined {
        return undefined;
    }

    visit_gdef(node: GlobalDef): Application | undefined {
        return this.do_visit(node.def());
    }
}

class CallByNameReduceVisitor extends LambdaVisitor<Application | undefined> {

    visit_appl(node: Application): Application | undefined {
        if(node.isRedex()) {
            return node;
        }
        let redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    }

    visit_abst(node: Abstraction): Application | undefined {
        return undefined;
    }

    visit_var(node: Variable): Application | undefined {
        return undefined;
    }

    visit_gdef(node: GlobalDef): Application | undefined {
        return this.do_visit(node.def());
    }
}

function isValue(node: Lambda) {
    return node.isAbstraction();
}

class CallByValueReduceVisitor extends LambdaVisitor<Application | undefined> {

    visit_appl(node: Application): Application | undefined {
        if(node.isRedex() && isValue(node.arg())) {
            return node;
        }
        let redex = this.do_visit(node.func());
        return redex || this.do_visit(node.arg());
    }

    visit_abst(node: Abstraction): Application | undefined {
        return undefined;
    }

    visit_var(node: Variable): Application | undefined {
        return undefined;
    }

    visit_gdef(node: GlobalDef): Application | undefined {
        return this.do_visit(node.def());
    }
}

