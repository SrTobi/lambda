"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lambda_1 = require("./lambda");
function to_string(l, opts) {
    if (opts === void 0) { opts = {}; }
    if (opts.print_id) {
        opts.print_paren = true;
    }
    return tos(l, false, false);
    function tos(lmb, inAppl, firstInAppl) {
        var ToStringVisitor = /** @class */ (function (_super) {
            __extends(ToStringVisitor, _super);
            function ToStringVisitor() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ToStringVisitor.prototype.visit_appl = function (node) {
                var f = tos(node.func(), true, true);
                var a = tos(node.arg(), true, false);
                return this.p(f + " " + a, { paren: inAppl && !firstInAppl });
            };
            ToStringVisitor.prototype.visit_abst = function (node) {
                var name = node.name();
                var body = tos(node.body(), false, false);
                return this.p("\\" + name + "." + body, { paren: inAppl });
            };
            ToStringVisitor.prototype.visit_var = function (node) {
                return this.p(node.name(), { def: node.def() });
            };
            ToStringVisitor.prototype.visit_gdef = function (node) {
                var name = node.name();
                var def = tos(node.def(), false, false);
                return this.p(name + " = " + def);
            };
            ToStringVisitor.prototype.appedix = function (info) {
                var result = [];
                if (opts.print_id) {
                    result.push("id=" + lmb.id());
                }
                if (opts.print_def && info.def) {
                    result.push("def=" + info.def.id());
                }
                return result.length ? "[" + result.join(",") + "]" : "";
            };
            ToStringVisitor.prototype.p = function (str, info) {
                if (info === void 0) { info = {}; }
                return (opts.print_paren || info.paren ? "(" + str + ")" : str) + this.appedix(info);
            };
            return ToStringVisitor;
        }(lambda_1.LambdaVisitor));
        var alias = lmb.alias();
        if (alias && l != alias && !opts.expand_alias) {
            return alias.name();
        }
        var v = new ToStringVisitor();
        return v.do_visit(lmb);
    }
}
exports.to_string = to_string;
//# sourceMappingURL=textPrinter.js.map