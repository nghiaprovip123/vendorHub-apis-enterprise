"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthCallbackController = void 0;
const cookie_utils_1 = require("@/common/utils/cookie.utils");
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
        res.cookie("refreshToken", refreshToken, cookie_utils_1.optionsCookie);
        return res.status(200).json({
            success: true,
            accessToken,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.GoogleOAuthCallbackController = GoogleOAuthCallbackController;
