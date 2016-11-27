"use strict";
const lambda_1 = require("./lambda");
function to_string(l, opts = {}) {
    if (opts.print_id) {
        opts.print_paren = true;
    }
    return tos(l, false, false);
    function tos(lmb, inAppl, firstInAppl) {
        class ToStringVisitor extends lambda_1.LambdaVisitor {
            visit_appl(node) {
                let f = tos(node.func(), true, true);
                let a = tos(node.arg(), true, false);
                return this.p(`${f} ${a}`, { paren: inAppl && !firstInAppl });
            }
            visit_abst(node) {
                let name = node.name();
                let body = tos(node.body(), false, false);
                return this.p(`\\${name}.${body}`, { paren: inAppl });
            }
            visit_var(node) {
                return this.p(node.name(), { def: node.def() });
            }
            visit_gdef(node) {
                let name = node.name();
                let def = tos(node.def(), false, false);
                return this.p(`${name} = ${def}`);
            }
            appedix(info) {
                let result = [];
                if (opts.print_id) {
                    result.push(`id=${lmb.id()}`);
                }
                if (opts.print_def && info.def) {
                    result.push(`def=${info.def.id()}`);
                }
                return result.length ? `[${result.join(",")}]` : "";
            }
            p(str, info = {}) {
                return (opts.print_paren || info.paren ? `(${str})` : str) + this.appedix(info);
            }
        }
        let alias = lmb.alias();
        if (alias && l != alias && !opts.expand_alias) {
            return alias.name();
        }
        let v = new ToStringVisitor();
        return v.do_visit(lmb);
    }
}
exports.to_string = to_string;
//# sourceMappingURL=textPrinter.js.map