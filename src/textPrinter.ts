import {Lambda, LambdaVisitor, Application, Abstraction, Definition, Variable, GlobalDef} from "./lambda";

export interface PrintOptions {
    print_id?: boolean,
    print_def?: boolean,
    print_paren?: boolean,
    expand_alias?: boolean
}

interface AppedixInfo {
    paren?: boolean
    def?: Definition
}

export function to_string(l: Lambda, opts:PrintOptions = {}): string {
    if(opts.print_id) {
        opts.print_paren = true;
    }
    return tos(l, false, false);

    function tos(lmb: Lambda, inAppl: boolean, firstInAppl: boolean): string {

        class ToStringVisitor extends LambdaVisitor<string> {
            visit_appl(node: Application): string {
                let f = tos(node.func(), true, true);
                let a = tos(node.arg(), true, false);
                return this.p(`${f} ${a}`, {paren: inAppl && !firstInAppl });
            }

            visit_abst(node: Abstraction): string {
                let name = node.name();
                let body = tos(node.body(), false, false);
                return this.p(`\\${name}.${body}`, {paren: inAppl });
            }

            visit_var(node: Variable): string {
                return this.p( node.name(), {def: node.def()});
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
        let alias = lmb.alias();
        if(alias && l != alias && !opts.expand_alias) {
            return alias.name();
        }
        let v = new ToStringVisitor();
        return v.do_visit(lmb);
    }
}
