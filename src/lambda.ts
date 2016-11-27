
export abstract class LambdaVisitor <T> {
    do_visit(node: Lambda): T {
        return node._accept(this);
    }

    abstract visit_appl(node: Application): T;
    abstract visit_abst(node: Abstraction): T;
    abstract visit_var(node: Variable): T;
    abstract visit_gdef(node: GlobalDef): T;
}

export abstract class Lambda {
    public _alias?: GlobalDef;

    constructor(private _id: number) {
    }

    id(): number {
        return this._id;
    }

    alias(): GlobalDef | undefined {
        return this._alias;
    }

    isApplication(): boolean {
        return false;
    }

    isAbstraction(): boolean {
        return false;
    }

    isVariable(): boolean {
        return false;
    }

    isGlobalDef(): boolean {
        return false;
    }

    abstract _accept<T>(visitor: LambdaVisitor<T>): T;
}

export class Application extends Lambda {
    constructor(id: number, public _func: Lambda, public _arg: Lambda) {
        super(id);
    }

    func(): Lambda {
        return this._func;
    }

    arg(): Lambda {
        return this._arg;
    }

    isApplication(): boolean {
        return true;
    }

    isRedex(): boolean {
        return this.func().isAbstraction();
    }

    _accept<T>(visitor: LambdaVisitor<T>): T {
        return visitor.visit_appl(this);
    }
}

export abstract class Definition extends Lambda {
    public _usages: Variable[] = [];

    usages(): Variable[] {
        return this._usages;
    }

}

export class Abstraction extends Definition {

    constructor(id: number, public _name: string, public _body: Lambda) {
        super(id);
    }

    name(): string {
        return this._name;
    }

    body(): Lambda {
        return this._body
    }

    isAbstraction(): boolean {
        return true;
    }

    _accept<T>(visitor: LambdaVisitor<T>): T {
        return visitor.visit_abst(this);
    }
}

export class Variable extends Lambda {

    public _def: Definition;

    constructor(id: number, private _name: string) {
        super(id);
    }

    name(): string {
        return this._name;
    }

    def(): Definition {
        return this._def;
    }

    isVariable(): boolean {
        return true;
    }

    isBound(): boolean {
        return this.def() && this.def().isAbstraction();
    }

    _accept<T>(visitor: LambdaVisitor<T>): T {
        return visitor.visit_var(this);
    }
}

export class GlobalDef extends Definition {

    constructor(id: number, private _name: string, public _def: Lambda) {
        super(id);
        _def._alias = this;
    }

    name(): string {
        return this._name;
    }

    def(): Lambda {
        return this._def;
    }

    _accept<T>(visitor: LambdaVisitor<T>): T {
        return visitor.visit_gdef(this);
    }

    isGlobalDef(): boolean {
        return true;
    }
}


export class LambdaFactory {
    private nextId = 1;

    constructor() {
    }

    newVariable(name: string): Variable {
        return new Variable(this.next(), name);
    }

    newAbstraction(name: string, body: Lambda): Abstraction {
        return new Abstraction(this.next(), name, body);
    }

    newApplication(func: Lambda, arg: Lambda): Application {
        return new Application(this.next(), func, arg);
    }

    newGlobalDefiniton(name: string, def: Lambda): GlobalDef {
        return new GlobalDef(this.next(), name, def);
    }

    next(): number {
        return this.nextId++;
    }

    clone(lmb: Lambda): Lambda {
        return new CloneVisitor(this).do_visit(lmb);
    }

    reduce(lmb: Lambda, redex: Application): Lambda {
        if(!redex.isRedex()) {
            throw "Is no redex!";
        }
        return new CloneVisitor(this, redex).do_visit(lmb);
    }
}

class CloneVisitor extends LambdaVisitor<Lambda> {

    private usage: { [id: number] : Variable[]; } = {};
    private replaceVarDef?: Abstraction;
    private replaceDef?: Lambda;
    private changed: boolean = false;

    constructor(private factory: LambdaFactory, private redex: Application | undefined = undefined) {
        super();
    }

    visit_appl(node: Application): Lambda {
        if(node == this.redex) {
            let abst = <Abstraction>(node.func());
            this.replaceVarDef = abst;
            this.replaceDef = node.arg();
            let body = this.do_visit(abst.body());
            this.replaceDef = undefined;
            this.replaceVarDef = undefined;
            this.changed = true;
            return body;
        }else{
            let inCh = this.changed;
            let func = this.do_visit(node.func());
            let argCh = this.changed;
            this.changed = inCh;
            let arg = this.do_visit(node.arg());
            this.changed = this.changed || argCh;
            let newN = this.factory.newApplication(func, arg);
            if(!this.changed)
                newN._alias = node._alias;
            return newN;
        }
    }

    visit_abst(node: Abstraction): Lambda {
        let usages: Variable[] = [];
        this.usage[node.id()] = usages;
        let body = this.do_visit(node.body());
        let newN = this.factory.newAbstraction(node.name(), body);
        if(usages.length != node._usages.length) {
            console.log("not equal!");
        }
        if(!this.changed)
            newN._alias = node._alias;
        
        if(usages.length > 0) {
            newN._usages = usages;
            for(let use of usages) {
                use._def = newN;
            }
        }
        return newN;
    }

    visit_var(node: Variable): Lambda {
        let name = node.name();
        let newN = this.factory.newVariable(name);
        if(!this.changed)
            newN._alias = node._alias;
        
        let def = node.def();
        if(def) {
            if(def == this.replaceVarDef) {
                return this.do_visit(this.replaceDef as Lambda);
            }else{
                let id = def.id();
                (this.usage[id] || (this.usage[id] = [])).push(newN);
            }
        }
        return newN;
    }

    visit_gdef(node: GlobalDef): Lambda {
        let name = node.name();
        let def = this.do_visit(node.def());
        let newN = this.factory.newGlobalDefiniton(name, def);
        if(!this.changed)
            newN._alias = node._alias;
        return newN;
    }
}