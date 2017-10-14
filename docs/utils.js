"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultRandomStrings = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomString(length, chars) {
    if (length === void 0) { length = 8; }
    if (chars === void 0) { chars = defaultRandomStrings; }
    var result = "";
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}
exports.randomString = randomString;
function normFloat(num) {
    return parseFloat((Math.round(num * 100) / 100).toFixed(2));
}
exports.normFloat = normFloat;
//# sourceMappingURL=utils.js.map