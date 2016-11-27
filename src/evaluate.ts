import {Lambda, Application, Definition, Variable, Abstraction, GlobalDef, LambdaVisitor, LambdaFactory} from './lambda';
import {to_string} from './textPrinter';


export type ReduceStrategy = (lmb: Lambda) => Application | undefined;

export function normalReduce(lmb: Lambda): Application | undefined {
    return new NormalReduceVisitor().do_visit(lmb);
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
