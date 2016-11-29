import {Lambda, LambdaFactory, Application, Abstraction, Definition, GlobalDef, Variable, LambdaVisitor} from './lambda';
import {parse} from './parse';

export class Block {

    private defs: { [name: string] : GlobalDef; } = {};
    private exprs: Lambda[] = [];
    private code: string = "";
    private child: Block;
    private enabled = true;

    constructor(private factory: LambdaFactory, private _parent?: Block, private onRecompile?: (context: Block) => void) {
        if(_parent) {
            _parent.child = this;
        }
    }

    enable(enable: boolean) {
        let wasEnabled = this.enabled;
        this.enabled = enable;

        this.compile();

        if(wasEnabled != enable && this.child) {
            this.child.compile();
        }
    }

    isEnabled() {
        return this.enabled;
    }

    setCode(code: string): void {
        this.code = code;
        this.compile();
    }

    lookup(name: string): GlobalDef | undefined {
        let def = this.defs[name];
        if(def) {
            return def;
        }else if(this._parent) {
            return this._parent.lookup(name);
        }
    }

    definitions(): GlobalDef[] {
        let defs: GlobalDef[] = [];
        for(let def in this.defs) {
            defs.push(this.defs[def]);
        }
        return defs;
    }

    expressions(): Lambda[] {
        return this.exprs;
    }

    compile() {
        this.defs = {};
        this.exprs = [];

        if(!this.enabled) {
            return;
        }
        
        let entities = parse(this.code, this.factory);

        for(let entity of entities) {
            let visitor = new ResolveVisitor(this, this.factory);
            let ast = visitor.do_visit(entity);
            if(ast.isGlobalDef()) {
                let def = ast as GlobalDef;
                this.defs[def.name()] = def;
            }else{
                this.exprs.push(ast);
            }
        }

        if(this.onRecompile) {
            this.onRecompile(this);
        }

        if(this.child) {
            this.child.compile();
        }
    }
}

class ResolveVisitor extends LambdaVisitor<Lambda> {

    private defs: { [name: string] : Definition; } = {};

    constructor(private context: Block, private factory: LambdaFactory) {
        super();
    }

    visit_appl(node: Application): Lambda {
        node._func = this.do_visit(node.func());
        node._arg = this.do_visit(node.arg());
        return node;
    }

    visit_abst(node: Abstraction): Lambda {
        let name = node.name();
        let old = this.defs[name];
        this.defs[name] = node;
        node._body = this.do_visit(node.body());
        this.defs[name] = old;
        return node;
    }

    visit_var(node: Variable): Lambda {
        let name = node.name();
        let def = this.defs[name];
        if(def) {
            node._def = def;
            def._usages.push(node);
        }else{
            let ref = this.context.lookup(name);
            if(ref) {
                return this.factory.clone(ref.def());
            }
        }
        return node;
    }

    visit_gdef(node: GlobalDef): Lambda {
        node._def = this.do_visit(node.def());
        return node;
    }
}
