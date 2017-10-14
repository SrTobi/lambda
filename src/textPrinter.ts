import {Lambda, LambdaVisitor, Application, Abstraction, Definition, Variable, GlobalDef} from "./lambda";

export interface PrintOptions {
    print_id?: boolean,
    print_def?: boolean,
    print_paren?: boolean,
    expand_alias?: boolean,
    force_expand_aliases?: Set<Lambda>,
    appl_pp?: Map<Application, (func: string, param: string) => [string, string]>
}

interface AppedixInfo {
    paren?: boolean
    def?: Definition
}

export function to_string(l: Lambda, opts:PrintOptions = {}): string {
    if(opts.print_id) {
        opts.print_paren = true;
    }
    opts.appl_pp = opts.appl_pp || new Map()
    opts.force_expand_aliases = opts.force_expand_aliases || new Set()

    var boundNames: string[] = []
    return tos(l, false, false);

    function tos(lmb: Lambda, inAppl: boolean, firstInAppl: boolean): string {

        class ToStringVisitor extends LambdaVisitor<string> {
            visit_appl(node: Application): string {
                let f = tos(node.func(), true, true);
                let a = tos(node.arg(), true, false);
                let pp = opts.appl_pp!.get(node) || ((a, b) => [a, b]);
                [f, a] = pp(f, a);
                return this.p(`${f} ${a}`, {paren: inAppl && !firstInAppl });
            }

            visit_abst(node: Abstraction): string {
                let name = node.name();

                boundNames.push(name);
                let body = tos(node.body(), false, false);
                boundNames.pop();

                return this.p(`\\${name}.${body}`, {paren: inAppl });
            }

            visit_var(node: Variable): string {
                let str = this.p( node.name(), {def: node.def()});
                if(!node.isBound()) {
                    str = prependIfBound("$", str);
                }
                return str;
            }

            visit_gdef(node: GlobalDef): string {
                let name = node.name();
                let def = tos(node.def(), false, false);
                return this.p(`${name} = ${def}`);
            }

            private appedix(info: AppedixInfo): string {
                let result: string[] = [];
                if(opts.print_id) {
                    result.push(`id=${lmb.id()}`);
                }
                if(opts.print_def && info.def) {
                    result.push(`def=${info.def.id()}`);
                }
                return result.length? `[${result.join(",")}]` : "";
            }


            private p(str: string, info: AppedixInfo = {}) {
                return (opts.print_paren || info.paren? `(${str})` : str) + this.appedix(info);
            }
        }
        function prependIfBound(c: string, name: string) {
            if (boundNames.indexOf(name) >= 0) {
                name = c + name;
            }
            return name;
        }
        let alias = lmb.alias();
        if(alias && !opts.expand_alias && !opts.force_expand_aliases!.has(lmb)) {
            return prependIfBound("@", alias.name());
        }
        let v = new ToStringVisitor();
        return v.do_visit(lmb);
    }
}
