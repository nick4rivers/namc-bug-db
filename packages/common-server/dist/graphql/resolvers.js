"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Query: {
        helloWorld: function (obj, _a, ctx, info) {
            var name = _a.name;
            return {
                message: "Hello " + name + "!",
                friendly: Math.random() < 0.5
            };
        }
    }
};
//# sourceMappingURL=resolvers.js.map