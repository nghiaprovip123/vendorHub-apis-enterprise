"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const auth_core_guard_1 = require("../../common/guards/auth-core.guard");
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.split(" ")[1];
        const user = auth_core_guard_1.AuthGuard.verifyAccessToken(token);
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
exports.requireAuth = requireAuth;
