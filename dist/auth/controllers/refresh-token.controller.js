"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenController = void 0;
const refresh_token_service_1 = require("@/auth/services/refresh-token.service");
const cookie_utils_1 = require("@/common/utils/cookie.utils");
const RefreshTokenController = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new Error("THIẾU REFRESH TOKEN");
        }
        const userAgent = req.headers["user-agent"] ?? null;
        const result = await refresh_token_service_1.RefreshTokenService.execute(refreshToken, userAgent);
        res.cookie("refreshToken", result.refreshToken, cookie_utils_1.optionsCookie);
        return res.status(200).json({
            success: true,
            accessToken: result.accessToken,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.RefreshTokenController = RefreshTokenController;
