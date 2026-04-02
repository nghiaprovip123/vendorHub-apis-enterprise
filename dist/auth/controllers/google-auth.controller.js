"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthCallbackController = void 0;
const google_auth_service_1 = require("@/auth/services/google-auth.service");
const GoogleOAuthCallbackController = async (req, res, next) => {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).json({ message: "MISSING AUTHORIZATION CODE" });
        }
        const userAgent = req.headers["user-agent"] ?? null;
        const { accessToken, refreshToken } = await google_auth_service_1.GoogleCallbackAuthService.execute({
            code,
            userAgent,
        });
        // ✅ FIX: Truyền tokens qua URL params để FE tự set cookie
        // Dùng encodeURIComponent để encode special characters trong token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;
        return res.redirect(redirectUrl);
    }
    catch (err) {
        next(err);
    }
};
exports.GoogleOAuthCallbackController = GoogleOAuthCallbackController;
