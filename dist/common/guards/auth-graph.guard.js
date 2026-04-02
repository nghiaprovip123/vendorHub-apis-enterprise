"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (ctx) => {
    if (!ctx.authid) {
        throw new Error("UNAUTHENTICATED");
    }
};
exports.requireAuth = requireAuth;
