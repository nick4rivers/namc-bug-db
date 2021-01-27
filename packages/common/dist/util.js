"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snake2camel = exports.camel2snake = exports.util1 = void 0;
var change_case_1 = require("change-case");
exports.util1 = function () {
    return 'hi';
};
exports.camel2snake = function (inobj) {
    return Object.keys(inobj).reduce(function (acc, key) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[change_case_1.snakeCase(key)] = inobj[key], _a)));
    }, {});
};
exports.snake2camel = function (inobj) {
    return Object.keys(inobj).reduce(function (acc, key) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[change_case_1.camelCase(key)] = inobj[key], _a)));
    }, {});
};
//# sourceMappingURL=util.js.map